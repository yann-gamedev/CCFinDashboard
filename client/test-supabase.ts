/**
 * Supabase Connection Test Script
 * Run with: npx tsx test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(import.meta.dirname ?? '.', '.env.local') })

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

console.log('='.repeat(50))
console.log('  SUPABASE CONNECTION TEST')
console.log('='.repeat(50))
console.log()

if (!url || !key) {
    console.error('[FAIL] Missing environment variables!')
    console.error('  VITE_SUPABASE_URL:', url ? 'OK' : 'MISSING')
    console.error('  VITE_SUPABASE_ANON_KEY:', key ? 'OK' : 'MISSING')
    process.exit(1)
}

console.log('[INFO] URL:', url)
console.log('[INFO] Key:', key.slice(0, 20) + '...')
console.log()

const supabase = createClient(url, key)

async function runTests() {
    let passed = 0
    let failed = 0

    // Test 1: Auth health check
    console.log('--- Test 1: Auth Service ---')
    try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
            console.error('[FAIL] Auth error:', error.message)
            failed++
        } else {
            console.log('[PASS] Auth service responsive')
            console.log('  Session:', data.session ? 'Active' : 'No active session (expected)')
            passed++
        }
    } catch (e) {
        console.error('[FAIL] Auth connection failed:', (e as Error).message)
        failed++
    }
    console.log()

    // Test 2: Database query (will fail if no tables exist, but connection should work)
    console.log('--- Test 2: Database Connection ---')
    try {
        const { data, error } = await supabase
            .from('user_data')
            .select('*')
            .limit(1)
        
        if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('[WARN] Table "user_data" does not exist yet.')
                console.log('  -> Connection works, but database schema not configured.')
                console.log('  -> You need to create the "user_data" table in Supabase.')
                passed++
            } else if (error.code === 'PGRST204' || error.code === 'PGRST116') {
                console.log('[PASS] Database connected (no data found, which is expected)')
                passed++
            } else {
                console.error('[FAIL] Database error:', error.message, `(code: ${error.code})`)
                failed++
            }
        } else {
            console.log('[PASS] Database connected successfully!')
            console.log('  Rows found:', data?.length ?? 0)
            passed++
        }
    } catch (e) {
        console.error('[FAIL] Database connection failed:', (e as Error).message)
        failed++
    }
    console.log()

    // Test 3: Storage (check if service responds)
    console.log('--- Test 3: Storage Service ---')
    try {
        const { data, error } = await supabase.storage.listBuckets()
        if (error) {
            console.log('[WARN] Storage error:', error.message)
            console.log('  -> This is normal if storage is not configured.')
            passed++
        } else {
            console.log('[PASS] Storage service responsive')
            console.log('  Buckets:', data?.length ?? 0)
            passed++
        }
    } catch (e) {
        console.error('[FAIL] Storage connection failed:', (e as Error).message)
        failed++
    }
    console.log()

    // Test 4: Realtime check
    console.log('--- Test 4: API Reachability ---')
    try {
        const response = await fetch(`${url}/rest/v1/`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        })
        if (response.ok || response.status === 200) {
            console.log('[PASS] REST API is reachable (HTTP', response.status, ')')
            passed++
        } else {
            console.log('[WARN] REST API responded with HTTP', response.status)
            console.log('  -> This may be normal depending on configuration.')
            passed++
        }
    } catch (e) {
        console.error('[FAIL] Cannot reach Supabase API:', (e as Error).message)
        failed++
    }

    // Summary
    console.log()
    console.log('='.repeat(50))
    console.log(`  RESULTS: ${passed} passed, ${failed} failed`)
    console.log('='.repeat(50))

    if (failed > 0) {
        console.log()
        console.log('Troubleshooting tips:')
        console.log('1. Verify VITE_SUPABASE_URL is your project URL (not REST API URL)')
        console.log('   Correct:   https://xxxxx.supabase.co')
        console.log('   Incorrect: https://xxxxx.supabase.co/rest/v1/')
        console.log('2. Verify VITE_SUPABASE_ANON_KEY is the "anon public" key')
        console.log('   Find it at: Supabase Dashboard -> Settings -> API')
        console.log('3. Make sure your Supabase project is active (not paused)')
    }

    process.exit(failed > 0 ? 1 : 0)
}

runTests()
