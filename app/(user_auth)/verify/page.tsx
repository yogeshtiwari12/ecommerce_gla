"use client"
import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Timer, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import Link from 'next/link'

function VerifyFormContent() {
    const searchParams = useSearchParams()
    const { data: session } = useSession()

    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [resendTimer, setResendTimer] = useState(60)
    const [canResend, setCanResend] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        const queryEmail = searchParams?.get('email')
        const queryName = searchParams?.get('name')

        let initialEmail = queryEmail || ''
        let initialName = queryName || ''

        if (typeof window !== 'undefined') {
            if (!initialEmail) {
                initialEmail = sessionStorage.getItem('verification_email') || localStorage.getItem('verification_email') || ''
            }
            if (!initialName) {
                initialName = sessionStorage.getItem('verification_name') || localStorage.getItem('verification_name') || ''
            }
        }

        if (!initialEmail && session?.user?.email) {
            initialEmail = session.user.email
        }
        if (!initialName && session?.user?.name) {
            initialName = session.user.name
        }

        if (initialEmail) {
            setEmail(initialEmail)
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('verification_email', initialEmail)
            }
        }
        if (initialName) {
            setName(initialName)
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('verification_name', initialName)
            }
        }
    }, [searchParams, session])

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [resendTimer])

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        const newOtp = [...otp]
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            if (/^\d$/.test(pastedData[i])) {
                newOtp[i] = pastedData[i]
            }
        }
        setOtp(newOtp)
        const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus()
        } else {
            inputRefs.current[5]?.focus()
        }
    }

    const handleVerify = async () => {
        setLoading(true)
        const otpString = otp.join('')
        if (otpString.length !== 6) {
            toast.error('Please enter a complete 6-digit OTP')
            setLoading(false)
            return
        }
        if (!email.trim() && !name.trim()) {
            toast.error('Please provide your email address or full name')
            setLoading(false)
            return
        }
        try {
            const response = await axios.post('/api/verify', {
                otp: otpString,
                name: name.trim(),
                email: email.trim()
            }, {
                withCredentials: true,
            })

            console.log("Verify response:", response)

            if (response.data.success) {
                toast.success(response.data.message || 'Verification successful!')
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('verification_email')
                    sessionStorage.removeItem('verification_name')
                }
                setTimeout(() => {
                    window.location.href = '/sign-in'
                }, 1500)
            } else {
                toast.error(response.data.message || 'Verification failed')
            }

        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'An error occurred during verification')
            console.error('Verification error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email.trim()) {
            toast.error('Please enter your email to resend OTP')
            return
        }
        setCanResend(false)
        setResendTimer(60)

        try {
            const response = await axios.post('/api/resend-otp', {
                email: email.trim(),
                name: name.trim()
            }, {
                withCredentials: true,
            })

            console.log("Resend OTP response:", response)

            if (response.data.success) {
                toast.success(response.data.message || 'OTP resent successfully!')
            } else {
                toast.error(response.data.message || 'Failed to resend OTP')
                setCanResend(true)
                setResendTimer(0)
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Network error. Please check your connection and try again.')
            setCanResend(true)
            setResendTimer(0)
            console.error('Resend OTP error:', err)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-card border border-border rounded-xl shadow-lg">
                    <CardHeader className="space-y-2 text-center pb-4">
                        <CardTitle className="text-2xl text-primary font-bold">Verify Your Account</CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            We've sent a 6-digit verification code to
                        </CardDescription>
                        {email ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-foreground bg-primary/10 border border-primary/25 rounded-full py-1.5 px-4 mx-auto max-w-full w-fit">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-semibold text-primary break-all">{email}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/60 border border-border rounded-full py-1.5 px-4 mx-auto max-w-full w-fit">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>your email address</span>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-6">

                            <div className="space-y-2">
                                <Label className="text-center block text-sm font-medium text-muted-foreground">
                                    Enter 6-Digit Verification Code
                                </Label>
                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={el => { inputRefs.current[index] = el }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-11 h-12 text-center text-lg font-semibold text-foreground bg-card border border-border focus:border-primary focus:ring-2 focus:ring-blue-200"
                                            autoComplete="off"
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleVerify}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify OTP'
                                )}
                            </Button>

                            <div className="text-center space-y-2 pt-1">
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the code?
                                </p>
                                {canResend ? (
                                    <Button
                                        variant="outline"
                                        onClick={handleResend}
                                        className="text-sm bg-card border-border text-foreground hover:bg-muted hover:text-primary hover:border-primary/30"
                                    >
                                        Resend OTP
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                                        <Timer className="h-4 w-4 mr-1 text-primary" />
                                        <span>Resend in {resendTimer}s</span>
                                    </div>
                                )}
                            </div>

                            <CardDescription className="text-center text-sm text-muted-foreground pt-2">
                                Already have an account?{" "}
                                <Link href="/sign-in" className="text-primary font-medium hover:underline">
                                    Sign in here
                                </Link>
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyFormContent />
        </Suspense>
    )
}
