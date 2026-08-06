// TEMPORARY DEBUG — remove after fixing Netlify
useEffect(() => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  console.log('=== ENV DEBUG ===', {
    urlExists: !!url,
    urlLength: url?.length,
    urlStart: url?.substring(0, 25),
    urlEnd: url?.substring(url?.length - 15),
    urlTrimmedStart: url?.trim()?.substring(0, 25),
    keyExists: !!key,
    keyLength: key?.length,
    keyStart: key?.substring(0, 15),
    keyEnd: key?.substring(key?.length - 5),
  })
}, [])
