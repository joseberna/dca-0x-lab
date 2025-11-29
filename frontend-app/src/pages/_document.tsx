import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/dedlyfi-logo.png" />
        <meta name="description" content="DedlyFi - Dollar Cost Averaging on Blockchain" />
        <meta name="theme-color" content="#00d4ff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
