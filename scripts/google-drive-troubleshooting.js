const { google } = require("googleapis")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function runTroubleshooting() {
  console.log('--- Google Drive API Troubleshooting ---');
  console.log('This script will help you verify your Google Drive setup.');

  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
    console.error('\nERROR: Missing one or more required environment variables:');
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) console.error(' - GOOGLE_SERVICE_ACCOUNT_EMAIL');
    if (!GOOGLE_PRIVATE_KEY) console.error(' - GOOGLE_PRIVATE_KEY');
    if (!GOOGLE_DRIVE_FOLDER_ID) console.error(' - GOOGLE_DRIVE_FOLDER_ID');
    console.log('\nPlease ensure these are set in your .env.local file or Vercel project settings.');
    rl.close();
    return;
  }

  console('\nAttempting to authenticate with Google...');
  let auth;
  try {
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    await auth.getClient(); // Test authentication
    console.log('✅ Authentication successful.');
  } catch (error) {
    console.error('❌ Authentication failed. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.');
    console.error('Error details:', error.message);
    rl.close();
    return;
  }

  const drive = google.drive({ version: 'v3', auth });

  console('\nChecking Google Drive folder access...');
  try {
    const res = await drive.files.get({
      fileId: GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id, name, mimeType, permissions',
    });

    const folder = res.data;
    console(`✅ Found folder: "${folder.name}" (ID: ${folder.id})`);
    if (folder.mimeType !== 'application/vnd.google-apps.folder') {
      console.warn('⚠️ Warning: The provided ID does not seem to belong to a folder. It might be a file ID.');
    }

    // Check permissions
    const permissions = folder.permissions;
    const serviceAccountPermission = permissions?.find(p => p.emailAddress === GOOGLE_SERVICE_ACCOUNT_EMAIL);

    if (serviceAccountPermission) {
      console(`✅ Service account has permission: "${serviceAccountPermission.role}"`);
      if (serviceAccountPermission.role !== 'writer' && serviceAccountPermission.role !== 'owner') {
        console.warn('⚠️ Warning: Service account might not have write access. Ensure it has "Editor" role on the folder.');
      }
    } else {
      console('❌ Service account does NOT have explicit permissions on this folder.');
      console('Please ensure you have shared the Google Drive folder with your service account email:');
      console(`   ${GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
      console('   And granted it "Editor" access.');
    }

    console(\'\nAttempting to create a test\
