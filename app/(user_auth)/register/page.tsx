"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

function Page() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/signup', formData, {
        withCredentials: true
      })

      if (response.data.success) {
        toast.success(response.data.message)
        setFormData({ name: '', email: '', password: '' })
        router.replace('/verify') 
        console.log(response.data);
      } else {
        toast.error(response.data.message)
        setError(response.data.message || 'Failed to create account. Please try again.')
      }
      console.log("Response data:", response.data);
      
    } catch (err) {
      const errorMessage = 'Network error. Please check your connection and try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-blue-600 text-center">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700" htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 text-gray-900 placeholder:text-gray-500 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700" htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 text-gray-900 placeholder:text-gray-500 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700" htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 pr-10 text-gray-900 placeholder:text-gray-500 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <CardDescription className="text-center text-sm text-gray-600 mt-2">
                Already have an account?{' '}
                <a href="/sign-in" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Sign in here
                </a>
              </CardDescription>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Page