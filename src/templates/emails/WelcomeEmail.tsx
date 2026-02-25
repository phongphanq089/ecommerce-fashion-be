import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Img,
  Link,
  Section,
  Font,
  Tailwind,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  verificationUrl: string;
  logoUrl?: string;
  companyName?: string;
  year?: string;
}

export const WelcomeEmail = ({
  name,
  verificationUrl,
  logoUrl = 'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
  companyName = 'APK APP',
  year = new Date().getFullYear().toString(),
}: WelcomeEmailProps) => {
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
      <Preview>Welcome to {companyName} - Action Required</Preview>

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
            {/* Header / Logo Section */}
            <Section className="pt-10 px-10 pb-5 text-center">
              <Img
                src={logoUrl}
                alt="Logo"
                width="80"
                height="80"
                className="rounded-full mx-auto mb-5 block"
              />
              <Text className="text-brand font-playfair text-[32px] italic font-medium m-0 mb-1">
                Welcome to{' '}
                <span className="not-italic font-bold">Ecommerce Fashion</span>
              </Text>
              <Text className="text-[#999999] text-[12px] tracking-[3px] m-0 uppercase">
                The epitome of style
              </Text>
            </Section>

            {/* Hero Image */}
            <Section>
              <Img
                src="https://framerusercontent.com/images/KxF8H6qGSaJvRZEhALbixoOrQg.jpg?scale-down-to=2048&width=1920&height=2400"
                alt="Fashion Model"
                className="object-cover w-full max-w-[600px] h-[350px]"
              />
            </Section>

            {/* Content Section */}
            <Section className="py-[50px] px-[60px] text-center">
              <Text className="text-brand font-playfair text-[20px] mb-6">
                Hello{' '}
                <span className="border-b border-solid border-[#cccccc] font-bold pb-0.5">
                  {name}
                </span>
                ,
              </Text>

              <Section className="text-[#666666] text-[16px] font-light leading-[1.6]">
                <Text className="mb-4">
                  You have requested a secure One-Time Password (OTP) for
                  authentication on{' '}
                  <strong className="text-brand font-bold">
                    {companyName}
                  </strong>
                  .
                </Text>
                <Text className="m-0">
                  To ensure the security of your account and continue your
                  journey into our exclusive collection, please verify your
                  identity below.
                </Text>
              </Section>

              {/* Call to Action Button */}
              <Section className="mt-10 mb-[30px]">
                <Link
                  href={verificationUrl}
                  className="bg-brand text-white inline-block font-playfair text-[16px] font-bold tracking-[2px] py-[15px] px-10 no-underline uppercase"
                >
                  Verify Now
                </Link>
              </Section>

              {/* Security Disclaimer */}
              <Text className="text-[#aaaaaa] text-[12px] leading-[1.5] mt-[30px] mx-auto mb-0 max-w-[350px]">
                If you did not request this OTP, please disregard this message.
                For your security, we recommend updating your password
                immediately.
              </Text>
            </Section>

            {/* Footer Section */}
            <Section className="bg-[#fcfcfc] border-t border-solid border-[#eeeeee] p-[30px] text-center">
              {/* Socials */}
              <Section className="mb-5">
                <Link
                  href="#"
                  className="text-[#999999] mx-2.5 no-underline text-[12px]"
                >
                  Instagram
                </Link>
                <Link
                  href="#"
                  className="text-[#999999] mx-2.5 no-underline text-[12px]"
                >
                  Facebook
                </Link>
                <Link
                  href="#"
                  className="text-[#999999] mx-2.5 no-underline text-[12px]"
                >
                  Twitter
                </Link>
              </Section>

              <Text className="text-[#999999] font-playfair text-[10px] tracking-[2px] m-0 uppercase">
                © {year} {companyName}. All rights reserved.
              </Text>

              <Text className="text-[#cccccc] text-[10px] mt-[15px] mb-0">
                <Link href="#" className="text-[#cccccc] underline">
                  Privacy Policy
                </Link>
                <span className="mx-[5px]">|</span>
                <Link href="#" className="text-[#cccccc] underline">
                  Terms of Service
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
