// ============================================================================
// MONKi Biz - 메인 애플리케이션
// ============================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { Env } from './types';
import authRoutes from './routes/auth';
import consultationsRoutes from './routes/consultations';
import contractsRoutes from './routes/contracts';
import installationsRoutes from './routes/installations';
import franchisesRoutes from './routes/franchises';

const app = new Hono<{ Bindings: Env }>();

// 정적 파일 서빙 (HTML 파일 우선)
app.get('*.html', serveStatic({ root: './' }));

// CORS 설정
app.use('/api/*', cors());

// API 라우트
app.route('/api/auth', authRoutes);
app.route('/api/consultations', consultationsRoutes);
app.route('/api/contracts', contractsRoutes);
app.route('/api/installations', installationsRoutes);
app.route('/api/franchises', franchisesRoutes);

// 메인 페이지 - 로그인 화면
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MONKi Biz - 로그인</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .login-card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
        }
        .btn-loading::after {
            content: "";
            position: absolute;
            width: 16px;
            height: 16px;
            top: 50%;
            left: 50%;
            margin-left: -8px;
            margin-top: -8px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spinner 0.6s linear infinite;
        }
        @keyframes spinner {
            to { transform: rotate(360deg); }
        }
        .shake {
            animation: shake 0.5s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="login-card w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl mb-4">
                <i class="fas fa-box text-white text-2xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-800">
                <span class="text-orange-500">MONKi</span> Biz
            </h1>
            <p class="text-gray-600 mt-2">통합 업무 관리 시스템</p>
        </div>

        <div id="alert" class="hidden mb-4 p-4 rounded-lg">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span id="alert-message"></span>
            </div>
        </div>

        <form id="loginForm" class="space-y-6">
            <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">
                    <i class="fas fa-user text-indigo-500 mr-2"></i>
                    아이디
                </label>
                <input 
                    type="text" 
                    id="user_id" 
                    name="user_id" 
                    required
                    autocomplete="username"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="아이디를 입력하세요"
                >
            </div>

            <div>
                <label class="block text-gray-700 text-sm font-semibold mb-2">
                    <i class="fas fa-lock text-indigo-500 mr-2"></i>
                    비밀번호
                </label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    required
                    autocomplete="current-password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="비밀번호를 입력하세요"
                >
            </div>

            <button 
                type="submit" 
                id="loginBtn"
                class="relative w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition transform hover:scale-105 active:scale-95"
            >
                <i class="fas fa-sign-in-alt mr-2"></i>
                로그인
            </button>
        </form>
    </div>

    <script>
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const alert = document.getElementById('alert');
        const alertMessage = document.getElementById('alert-message');

        function showAlert(message, type = 'error') {
            alert.className = type === 'error' 
                ? 'mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 shake'
                : 'mb-4 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200';
            alertMessage.textContent = message;
            alert.classList.remove('hidden');
            
            setTimeout(() => {
                alert.classList.add('hidden');
            }, 5000);
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user_id = document.getElementById('user_id').value.trim();
            const password = document.getElementById('password').value;

            if (!user_id || !password) {
                showAlert('아이디와 비밀번호를 입력해주세요.');
                return;
            }

            // 로딩 상태
            loginBtn.disabled = true;
            loginBtn.classList.add('btn-loading', 'opacity-75');
            loginBtn.innerHTML = '<span class="invisible">로그인</span>';

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id, password }),
                });

                const data = await response.json();

                if (data.success) {
                    showAlert('로그인 성공! 페이지를 이동합니다...', 'success');
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    showAlert(data.message || '로그인에 실패했습니다.');
                    loginBtn.disabled = false;
                    loginBtn.classList.remove('btn-loading', 'opacity-75');
                    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>로그인';
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('서버와의 통신 중 오류가 발생했습니다.');
                loginBtn.disabled = false;
                loginBtn.classList.remove('btn-loading', 'opacity-75');
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>로그인';
            }
        });

        // 엔터키 로그인
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    </script>
</body>
</html>
  `);
});

// 대시보드 페이지
app.get('/dashboard', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MONKi Biz - 대시보드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .sidebar {
            transition: all 0.3s ease;
        }
        .sidebar.collapsed {
            width: 80px;
        }
        .sidebar-item {
            transition: all 0.2s ease;
        }
        .sidebar-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(4px);
        }
        .sidebar-item.active {
            background: rgba(255, 255, 255, 0.15);
            border-left: 4px solid #f97316;
        }
        .fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-100">
    <!-- 로딩 오버레이 -->
    <div id="loadingOverlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-8 flex flex-col items-center">
            <div class="loading mb-4"></div>
            <p class="text-gray-700">처리 중입니다...</p>
        </div>
    </div>

    <div class="flex h-screen overflow-hidden">
        <!-- 사이드바 -->
        <aside id="sidebar" class="sidebar w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
            <!-- 로고 -->
            <div class="p-6 border-b border-gray-700">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <i class="fas fa-box text-white"></i>
                    </div>
                    <div class="sidebar-text">
                        <h1 class="text-xl font-bold"><span class="text-orange-400">MONKi</span> Biz</h1>
                        <p class="text-xs text-gray-400">v1.0.0</p>
                    </div>
                </div>
            </div>

            <!-- 사용자 정보 -->
            <div class="p-4 border-b border-gray-700">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="sidebar-text">
                        <p class="font-semibold" id="userName">로딩중...</p>
                        <p class="text-xs text-gray-400" id="userDept">-</p>
                    </div>
                </div>
            </div>

            <!-- 메뉴 -->
            <nav class="flex-1 overflow-y-auto py-4">
                <div class="px-4 mb-2">
                    <h3 class="sidebar-text text-xs font-semibold text-gray-400 uppercase">메인 업무</h3>
                </div>
                <a href="#" class="sidebar-item flex items-center px-4 py-3 active" data-page="dashboard">
                    <i class="fas fa-tachometer-alt w-6"></i>
                    <span class="sidebar-text ml-3">대시보드</span>
                </a>
                <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="consultation">
                    <i class="fas fa-comments w-6"></i>
                    <span class="sidebar-text ml-3">상담현황</span>
                    <span class="sidebar-text ml-auto bg-red-500 px-2 py-0.5 rounded-full text-xs" id="consultBadge">0</span>
                </a>
                <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="contract">
                    <i class="fas fa-file-contract w-6"></i>
                    <span class="sidebar-text ml-3">계약현황</span>
                    <span class="sidebar-text ml-auto bg-blue-500 px-2 py-0.5 rounded-full text-xs" id="contractBadge">0</span>
                </a>
                <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="installation">
                    <i class="fas fa-tools w-6"></i>
                    <span class="sidebar-text ml-3">설치현황</span>
                    <span class="sidebar-text ml-auto bg-green-500 px-2 py-0.5 rounded-full text-xs" id="installBadge">0</span>
                </a>
                <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="operating">
                    <i class="fas fa-store w-6"></i>
                    <span class="sidebar-text ml-3">운영등재</span>
                </a>
                <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="franchise">
                    <i class="fas fa-building w-6"></i>
                    <span class="sidebar-text ml-3">가맹점현황</span>
                </a>

                <div class="px-4 my-4 border-t border-gray-700 pt-4">
                    <h3 class="sidebar-text text-xs font-semibold text-gray-400 uppercase">서브 업무</h3>
                </div>
                <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="stock">
                    <i class="fas fa-boxes w-6"></i>
                    <span class="sidebar-text ml-3">재고관리</span>
                </a>
                <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="as">
                    <i class="fas fa-wrench w-6"></i>
                    <span class="sidebar-text ml-3">A/S관리</span>
                </a>

                <div id="systemMenu" class="hidden">
                    <div class="px-4 my-4 border-t border-gray-700 pt-4">
                        <h3 class="sidebar-text text-xs font-semibold text-gray-400 uppercase">시스템</h3>
                    </div>
                    <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="users">
                        <i class="fas fa-users w-6"></i>
                        <span class="sidebar-text ml-3">사용자 관리</span>
                    </a>
                    <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="pages">
                        <i class="fas fa-file w-6"></i>
                        <span class="sidebar-text ml-3">페이지 관리</span>
                    </a>
                    <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="locations">
                        <i class="fas fa-map-marker-alt w-6"></i>
                        <span class="sidebar-text ml-3">로케이션 관리</span>
                    </a>
                    <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="items">
                        <i class="fas fa-cube w-6"></i>
                        <span class="sidebar-text ml-3">아이템 관리</span>
                    </a>
                    <a href="#" class="sidebar-item flex items-center px-4 py-3" data-page="company">
                        <i class="fas fa-briefcase w-6"></i>
                        <span class="sidebar-text ml-3">회사정보 관리</span>
                    </a>
                </div>
            </nav>

            <!-- 로그아웃 -->
            <div class="p-4 border-t border-gray-700">
                <button id="logoutBtn" class="sidebar-item w-full flex items-center px-4 py-3 hover:bg-red-600 rounded-lg transition">
                    <i class="fas fa-sign-out-alt w-6"></i>
                    <span class="sidebar-text ml-3">로그아웃</span>
                </button>
            </div>
        </aside>

        <!-- 메인 컨텐츠 -->
        <main class="flex-1 overflow-y-auto">
            <!-- 헤더 -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center space-x-4">
                        <button id="toggleSidebar" class="text-gray-600 hover:text-gray-900">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                        <h2 class="text-2xl font-bold text-gray-800" id="pageTitle">대시보드</h2>
                    </div>
                    <div class="flex items-center space-x-4">
                        <!-- 알림 -->
                        <button class="relative text-gray-600 hover:text-gray-900">
                            <i class="fas fa-bell text-xl"></i>
                            <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                        </button>
                        <!-- 새로고침 -->
                        <button id="refreshBtn" class="text-gray-600 hover:text-gray-900">
                            <i class="fas fa-sync-alt text-xl"></i>
                        </button>
                    </div>
                </div>
            </header>

            <!-- 페이지 컨텐츠 -->
            <div id="pageContent" class="p-6">
                <div class="fade-in">
                    <h3 class="text-3xl font-bold text-gray-800 mb-6">환영합니다! 👋</h3>
                    
                    <!-- 통계 카드 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-blue-100 text-sm">상담대기</p>
                                    <h4 class="text-3xl font-bold mt-2">0</h4>
                                </div>
                                <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-comments text-2xl"></i>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-purple-100 text-sm">계약대기</p>
                                    <h4 class="text-3xl font-bold mt-2">0</h4>
                                </div>
                                <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-file-contract text-2xl"></i>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-green-100 text-sm">설치대기</p>
                                    <h4 class="text-3xl font-bold mt-2">0</h4>
                                </div>
                                <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-tools text-2xl"></i>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-orange-100 text-sm">운영중 가맹점</p>
                                    <h4 class="text-3xl font-bold mt-2">0</h4>
                                </div>
                                <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-store text-2xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 최근 활동 -->
                    <div class="bg-white rounded-xl shadow-md p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-history text-indigo-500 mr-2"></i>
                            최근 활동
                        </h3>
                        <div class="space-y-3">
                            <p class="text-gray-600">아직 활동 내역이 없습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        let currentUser = null;

        // 세션 체크
        async function checkSession() {
            try {
                const response = await fetch('/api/auth/session');
                const data = await response.json();

                if (!data.success) {
                    window.location.href = '/';
                    return;
                }

                currentUser = data.data.user;
                document.getElementById('userName').textContent = currentUser.name;
                document.getElementById('userDept').textContent = currentUser.department || '-';

                // 관리자면 시스템 메뉴 표시
                if (currentUser.role === 'admin') {
                    document.getElementById('systemMenu').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Session check error:', error);
                window.location.href = '/';
            }
        }

        // 로그아웃
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            if (!confirm('로그아웃 하시겠습니까?')) return;

            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/';
            } catch (error) {
                console.error('Logout error:', error);
                alert('로그아웃 처리 중 오류가 발생했습니다.');
            }
        });

        // 사이드바 토글
        document.getElementById('toggleSidebar').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
        });

        // 새로고침
        document.getElementById('refreshBtn').addEventListener('click', () => {
            location.reload();
        });

        // 페이지 네비게이션
        document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                
                // 페이지별 라우팅
                const routes = {
                    'dashboard': '/dashboard',
                    'consultation': '/consultations.html',
                    'contract': '/contracts.html',
                    'installation': '/installations.html',
                    'operating': '/operating.html',
                    'franchise': '/franchises.html',
                    'stock': '/stock.html',
                    'as': '/as.html'
                };

                if (routes[page]) {
                    window.location.href = routes[page];
                }
            });
        });

        // 초기화
        checkSession();
    </script>
</body>
</html>
  `);
});

// HTML 페이지 직접 서빙
app.get('/consultations.html', serveStatic({ path: './consultations.html' }));
app.get('/contracts.html', serveStatic({ path: './contracts.html' }));
app.get('/installations.html', serveStatic({ path: './installations.html' }));
app.get('/operating.html', serveStatic({ path: './operating.html' }));
app.get('/franchises.html', serveStatic({ path: './franchises.html' }));
app.get('/stock.html', serveStatic({ path: './stock.html' }));
app.get('/as.html', serveStatic({ path: './as.html' }));

export default app;

