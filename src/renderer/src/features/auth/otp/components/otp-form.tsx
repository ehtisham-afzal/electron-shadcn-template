import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'

const formSchema = z.object({
  otp: z
    .string()
    .min(6, 'Please enter the 6-digit code.')
    .max(6, 'Please enter the 6-digit code.'),
})

type OtpFormProps = React.HTMLAttributes<HTMLFormElement> & {
  email?: string
  type?: 'signup' | 'recovery' 
}

export function OtpForm({ className, email, type = 'signup', ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const { verifyOtp, resendOtp, isLoading } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  const otp = form.watch('otp')

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email) {
      toast.error('Email is required for OTP verification')
      return
    }

    const result = await verifyOtp(email, data.otp)

    if (result.success) {
      toast.success(result.message || 'Verification successful!')
      // Navigate based on type
      if (type === 'recovery') {
        navigate({ to: '/sign-in-2' })
      } else {
        navigate({ to: '/' })
      }
    } else {
      toast.error(result.message || 'Verification failed')
    }
  }

  async function handleResend() {
    if (!email) {
      toast.error('Email is required to resend OTP')
      return
    }

    const result = await resendOtp(email)

    if (result.success) {
      toast.success(result.message || 'OTP resent successfully!')
    } else {
      toast.error(result.message || 'Failed to resend OTP')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={otp.length < 6 || isLoading}>
          Verify
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={handleResend}
          disabled={isLoading}
        >
          Resend OTP
        </Button>
      </form>
    </Form>
  )
}
