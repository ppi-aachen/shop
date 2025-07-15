const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("Please paste the Google Sheet URL: ", (url) => {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/
  const match = url.match(regex)

  if (match && match[1]) {
    console.log(`\nExtracted Sheet ID: ${match[1]}`)
    console.log("\nSet this ID as GOOGLE_SHEET_ID in your .env.local file or Vercel environment variables.")
  } else {
    console.log("\nCould not extract a Sheet ID from the provided URL.")
    console.log(
      "Please ensure the URL is a valid Google Sheet link (e.g., https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit).",
    )
  }

  rl.close()
})
