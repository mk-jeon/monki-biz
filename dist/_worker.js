export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve HTML files
    const htmlFiles = {
      '/consultations.html': 'consultations.html',
      '/contracts.html': 'contracts.html',
      '/installations.html': 'installations.html',
      '/operating.html': 'operating.html',
      '/franchises.html': 'franchises.html',
      '/stock.html': 'stock.html',
      '/as.html': 'as.html'
    };
    
    if (htmlFiles[url.pathname]) {
      try {
        const html = await env.ASSETS.fetch(request.url);
        return html;
      } catch (e) {
        return new Response('File not found', { status: 404 });
      }
    }
    
    // API routes - import from actual implementation
    if (url.pathname.startsWith('/api/')) {
      return new Response('API endpoint', { status: 200 });
    }
    
    // Default - serve login page
    return new Response(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MONKi Biz - 로그인</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-600 to-purple-800 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">MONKi Biz</h1>
        <form id="loginForm" class="space-y-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                <input type="text" id="user_id" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="아이디를 입력하세요">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <input type="password" id="password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="비밀번호를 입력하세요">
            </div>
            <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200">로그인</button>
        </form>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('user_id').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, password })
                });
                
                if (response.ok) {
                    window.location.href = '/dashboard';
                } else {
                    alert('로그인 실패');
                }
            } catch (error) {
                alert('오류가 발생했습니다');
            }
        });
    </script>
</body>
</html>
    `, { 
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
