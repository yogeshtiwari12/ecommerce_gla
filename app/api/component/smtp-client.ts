import * as tls from 'tls'

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
}

export interface EmailData {
  from?: string
  to: string
  subject: string
  html: string
}

export class DirectSMTPClient {
  private config: SMTPConfig
  private socket: tls.TLSSocket | null = null

  constructor(config: SMTPConfig) {
    this.config = config
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = tls.connect({
        host: this.config.host,
        port: this.config.port,
        rejectUnauthorized: false,
      })

      this.socket.on('secureConnect', resolve)
      this.socket.on('error', reject)
      this.socket.setTimeout(30000, () => reject(new Error('Connection timeout')))
    })
  }

  private async waitForGreeting(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'))
      const onData = (data: Buffer) => {
        const greeting = data.toString()
        if (greeting.startsWith('220')) {
          this.socket?.off('data', onData)
          resolve()
        } else if (greeting.startsWith('4') || greeting.startsWith('5')) {
          this.socket?.off('data', onData)
          reject(new Error('Server error: ' + greeting))
        }
      }
      this.socket.on('data', onData)
      setTimeout(
        () => {
          this.socket?.off('data', onData)
          reject(new Error('Timeout waiting for greeting'))
        },
        15000
      )
    })
  }

  private async sendCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'))
      let response = ''
      const onData = (data: Buffer) => {
        response += data.toString()
        const lines = response.split(/\r?\n/).filter(line => line.trim().length > 0)
        const lastLine = lines[lines.length - 1]
        if (lastLine && /^\d{3}\s/.test(lastLine)) {
          this.socket?.off('data', onData)
          resolve(response.trim())
        }
      }
      this.socket.on('data', onData)
      if (command) {
        this.socket.write(command + '\r\n')
      }
      setTimeout(
        () => {
          this.socket?.off('data', onData)
          reject(new Error(`SMTP command timeout: ${command}`))
        },
        15000
      )
    })
  }

  private base64(str: string) {
    return Buffer.from(str).toString('base64')
  }

  private cleanEmailContent(content: string): string {
    return content.replace(/\0/g, '').trim()
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('🔧 Connecting to SMTP:', {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
      })

      await this.connect()
      console.log('✅ SMTP Connected via TLS')

      await this.waitForGreeting()
      console.log('✅ SMTP Greeting received')

      let response = await this.sendCommand('EHLO gmail.com')
      console.log('✅ EHLO response received')

      response = await this.sendCommand('AUTH LOGIN')
      if (!response.includes('334')) {
        throw new Error('AUTH LOGIN not supported: ' + response)
      }

      response = await this.sendCommand(this.base64(this.config.username))
      if (!response.includes('334')) {
        throw new Error('Username rejected: ' + response)
      }

      response = await this.sendCommand(this.base64(this.config.password))
      if (!response.includes('235')) {
        throw new Error('Authentication failed: ' + response)
      }
      console.log('✅ Authentication successful')

      response = await this.sendCommand(`MAIL FROM:<${this.config.username}>`)
      console.log('✅ MAIL FROM accepted')

      response = await this.sendCommand(`RCPT TO:<${emailData.to}>`)
      console.log('✅ RCPT TO accepted')

      response = await this.sendCommand('DATA')
      if (!response.includes('354')) {
        throw new Error('DATA command rejected: ' + response)
      }

      const cleanHtml = this.cleanEmailContent(emailData.html)
      const fromHeader = emailData.from
        ? (emailData.from.includes('<') ? emailData.from : `"${emailData.from}" <${this.config.username}>`)
        : `"Kudos" <${this.config.username}>`

      const emailContent = [
        `From: ${fromHeader}`,
        `To: ${emailData.to}`,
        `Subject: ${emailData.subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        cleanHtml,
      ].join('\r\n')

      this.socket?.write(emailContent + '\r\n')
      response = await this.sendCommand('.')
      console.log('✅ Email sent successfully:', response.substring(0, 50))

      try {
        await this.sendCommand('QUIT')
      } catch (_) {
        // ignore quit error
      }

      return response.startsWith('250')
    } catch (err) {
      console.error('❌ SMTP Error:', err)
      return false
    } finally {
      this.socket?.destroy()
      this.socket = null
    }
  }
}

export async function sendEmailUsingClient(emailData: EmailData): Promise<boolean> {
  if (!emailData.to || !emailData.subject || !emailData.html) {
    throw new Error('Missing email data')
  }

  const rawUsername = process.env.EMAIL_USER || process.env.SMTP_USERNAME || '';
  const rawPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || '';

  const username = rawUsername.trim().replace(/^["']|["']$/g, '');
  let password = rawPassword.trim().replace(/^["']|["']$/g, '');

  // Gmail App Passwords (16 letters): MUST strip all spaces, tabs, and newlines
  if (username.toLowerCase().includes('gmail') || password.includes(' ')) {
    password = password.replace(/\s+/g, '');
  }

  if (!username || !password) {
    console.warn('⚠️ EMAIL_USER / SMTP_USERNAME or EMAIL_PASSWORD / SMTP_PASSWORD is not set.');
    return false;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || '465');

  const client = new DirectSMTPClient({
    host,
    port,
    secure: port === 465,
    username,
    password,
  })

  return await client.sendEmail(emailData)
}

// Compatibility wrapper
export const transporter = {
  sendMail: async (options: {
    from?: string
    to: string
    subject: string
    html: string
    text?: string
  }) => {
    const success = await sendEmailUsingClient({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (!success) {
      throw new Error('Failed to send email via Direct SMTP client')
    }

    return { success }
  },
}
