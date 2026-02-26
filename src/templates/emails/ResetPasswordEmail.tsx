import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Link,
  Section,
  Font,
  Tailwind,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  name: string;
  resetPasswordUrl: string;
  companyName?: string;
  year?: string;
}

export default function ResetPasswordEmail({
  name,
  resetPasswordUrl,
  companyName = 'Ecommerce Fashion',
  year = new Date().getFullYear().toString(),
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Antonio"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/antonio/v16/d6jDMRoTyQ4P-f3VpEM.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXDTjmwiZt8bE.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Password Reset Request - {companyName}</Preview>

      {/* Cấu hình Tailwind cho các giá trị đặc thù */}
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: '#f54900',
                offwhite: '#f9f8f6',
              },
              fontFamily: {
                antonio: ['Antonio', 'Helvetica', 'Arial', 'sans-serif'],
                playfair: ['Playfair Display', 'serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-offwhite font-antonio m-0 py-10">
          <Container className="bg-white border-t-4 border-solid border-brand shadow-xl mx-auto w-full max-w-[600px]">
            {/* Header */}
            <Section className="pt-10 px-10 pb-5 text-center">
              <Text className="text-brand font-playfair text-[32px] italic font-medium m-0">
                <span className="not-italic font-bold">{companyName}</span>
              </Text>
              <Text className="text-[#999999] text-[11px] tracking-[3px] mt-2.5 mb-0 uppercase">
                The epitome of style
              </Text>
            </Section>

            {/* Content */}
            <Section className="py-[50px] px-[60px] text-center">
              <Text className="text-brand font-playfair text-[20px] mb-6">
                Hello{' '}
                <span className="border-b border-solid border-[#cccccc] font-bold pb-0.5">
                  {name}
                </span>
                ,
              </Text>

              <Section className="text-[#666666] text-[16px] font-light leading-[1.6] mb-[30px]">
                <Text className="mb-4">
                  You have requested a secure One-Time Password (OTP) for
                  authentication on{' '}
                  <strong className="text-brand font-bold">
                    {companyName}
                  </strong>
                  .
                </Text>
                <Text className="m-0">
                  To ensure your account security and continue exploring our
                  exclusive collection, please verify your identity.
                </Text>
              </Section>

              {/* Button */}
              <Section className="m-0">
                <Link
                  href={resetPasswordUrl}
                  className="bg-brand text-white inline-block font-playfair text-[15px] font-bold tracking-[2px] py-4 px-[45px] no-underline uppercase"
                >
                  Reset Password
                </Link>
              </Section>

              {/* Sub Link */}
              <Section className="pt-[25px]">
                <Text className="text-[#888888] text-[14px] m-0">
                  Forgot your password?
                  <Link
                    href={resetPasswordUrl}
                    className="text-brand font-bold underline ml-1"
                  >
                    Reset it here
                  </Link>
                </Text>
              </Section>

              {/* Disclaimer */}
              <Text className="border-t border-solid border-[#f4f4f4] text-[#aaaaaa] text-[12px] leading-[1.6] mt-[45px] mx-auto mb-0 max-w-[380px] pt-[25px]">
                If you did not request this OTP, please disregard this message.
                For your protection, we recommend updating your password
                immediately.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>

              <Text className="text-[#bbbbbb] text-[10px] mt-3 mb-0">
                <Link href="#" className="text-[#bbbbbb] no-underline">
                  Privacy Policy
                </Link>
                <span className="mx-2">|</span>
                <Link href="#" className="text-[#bbbbbb] no-underline">
                  Terms of Service
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
