const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

function checkEnvVariables() {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missingVars.forEach(variable => {
      console.error('\x1b[31m%s\x1b[0m', `  - ${variable}`);
    });
    console.error('\x1b[33m%s\x1b[0m', '\nPlease add these variables to your environment or .env file');
    process.exit(1);
  }
  
  console.log('\x1b[32m%s\x1b[0m', '✓ All required environment variables are set');
}

checkEnvVariables(); 