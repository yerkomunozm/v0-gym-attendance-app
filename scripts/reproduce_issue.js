
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log('--- Diagnostic Script ---');

    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('.env.local not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1');
        }
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    const supabase = createClient(supabaseUrl, supabaseKey);

    const targetTrainerId = '95f3d6b4-5b8e-4035-938a-a383fbfd102c'; // From user URL

    console.log(`Checking Trainer ID: ${targetTrainerId}`);
    const { data: trainer, error: trainerError } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', targetTrainerId)
        .single();

    if (trainerError) {
        console.error('ERROR finding trainer:', trainerError);
    } else {
        console.log('Trainer Found:', trainer.name, '| Branch ID:', trainer.branch_id);

        console.log('Checking students assigned to this trainer...');
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('trainer_id', targetTrainerId)
            .eq('membership_status', 'active');

        if (studentsError) {
            console.error('ERROR fetching students:', studentsError);
        } else {
            console.log(`Found ${students.length} active students assigned to trainer ${trainer.name}.`);
            if (students.length > 0) {
                console.log('Students:', students.map(s => s.name).join(', '));
            } else {
                console.log('⚠️  NO students are assigned to this trainer (trainer_id field).');
                console.log('   This could mean:');
                console.log('   1) Students exist but trainer_id is NULL or points to another trainer');
                console.log('   2) RLS is still blocking access');
            }
        }
    }

    // General check for ANY students
    console.log('\nChecking ANY students (no filter)...');
    const { data: allStudents, error: allError, count: allCount } = await supabase
        .from('students')
        .select('*', { count: 'exact' })
        .limit(5);

    if (allError) {
        console.error('ERROR fetching any students:', allError);
    } else {
        console.log(`Fetched ${allStudents.length} students (limit 5).`);
        if (allStudents.length === 0) {
            console.log('!!! WARNING: Students table appears EMPTY or fully BLOCKED to anon users. !!!');
        }
    }
}

main().catch(console.error);
