// Test the quiz API endpoint with module filtering
async function testAPI() {
    const exam = 'CEH';
    const mode = 'short';
    const modules = 'Evading IDS, Firewalls, and Honeypots';

    const url = `http://localhost:3000/api/quiz?exam=${encodeURIComponent(exam)}&mode=${encodeURIComponent(mode)}&modules=${encodeURIComponent(modules)}`;

    console.log('Testing API endpoint:');
    console.log(`URL: ${url}\n`);

    try {
        const res = await fetch(url);
        const data = await res.json();

        console.log('Response status:', res.status);
        console.log('Response data:');
        console.log(JSON.stringify(data, null, 2));

        if (data.questions) {
            console.log(`\nReceived ${data.questions.length} questions`);
            if (data.questions.length > 0) {
                console.log('First question module:', data.questions[0].module);
                console.log('All modules in response:');
                const modules = [...new Set(data.questions.map((q: any) => q.module))];
                modules.forEach(m => console.log(`  - ${m}`));
            }
        }
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
    }
}

testAPI();
