"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Timer, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

function Page() {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [resendTimer, setResendTimer] = useState(60)
    const [canResend, setCanResend] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        if (!name.trim()) {
            toast.error('Please enter your full name')
            setLoading(false)
            return
        }
        try {
            const response = await axios.post('/api/verify', {
                otp: otpString,
                name: name.trim(),
                email: new URLSearchParams(window.location.search).get('email')
            }, {
                withCredentials: true,
            });
            
            console.log("Verify response:", response);
            
            if (response.data.success) {
                toast.success(response.data.message || 'Verification successful!');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                toast.error(response.data.message || 'Verification failed');
            }

        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'An error occurred during verification');
            console.error('Verification error:', err);
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setCanResend(false)
        setResendTimer(60)
        
        try {
            const response = await axios.post('/api/resend-otp', {}, {
                withCredentials: true,
            })
            
            console.log("Resend OTP response:", response);
            
            if (response.data.success) {
                toast.success(response.data.message || 'OTP resent successfully!');
            } else {
                toast.error(response.data.message || 'Failed to resend OTP');
                setCanResend(true);
                setResendTimer(0);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Network error. Please check your connection and try again.');
            setCanResend(true);
            setResendTimer(0);
            console.error('Resend OTP error:', err);
        }
    }

    const isOtpComplete = otp.every(digit => digit !== '')

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-6">
            <div className="w-full max-w-md">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-blue-600 text-center">Verify Your Account</CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            We've sent a 6-digit verification code to your email address
                        </CardDescription>
                        <div className="flex items-center justify-center text-sm text-gray-600 mt-2">
                            <Mail className="h-4 w-4 mr-1" />
                            <span>user@example.com</span>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-gray-900 placeholder:text-gray-500 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-center block text-gray-700">Enter Verification Code</Label>
                                <div className="flex justify-center space-x-2">
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
                                            className="w-12 h-12 text-center text-lg font-semibold text-gray-900 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            autoComplete="off"
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleVerify}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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

                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    Didn't receive the code?
                                </p>
                                {canResend ? (
                                    <Button
                                        variant="outline"
                                        onClick={handleResend}
                                        className="text-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300"
                                    >
                                        Resend OTP
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <Timer className="h-4 w-4 mr-1" />
                                        <span>Resend in {resendTimer}s</span>
                                    </div>
                                )}
                            </div>

                            <CardDescription className="text-center text-sm text-gray-600 mt-2">
                                Already have an account?{" "}
                                <a href="/signin" className="text-blue-600 hover:text-blue-700 hover:underline">
                                    Sign in here
                                </a>
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Page