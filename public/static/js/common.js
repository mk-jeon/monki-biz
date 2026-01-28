// ============================================================================
// MONKi Biz - 프론트엔드 공통 유틸리티
// ============================================================================

/**
 * API 호출 헬퍼
 */
async function apiCall(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok && response.status === 401) {
    window.location.href = '/';
    return null;
  }

  return data;
}

/**
 * 로딩 오버레이 표시/숨김
 */
function showLoading(message = '처리 중입니다...') {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const messageEl = overlay.querySelector('p');
    if (messageEl) messageEl.textContent = message;
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

/**
 * 토스트 알림
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  } text-white`;
  toast.innerHTML = `
    <div class="flex items-center space-x-2">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 확인 다이얼로그
 */
function confirm(message, title = '확인') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
        <h3 class="text-xl font-bold text-gray-800 mb-3">
          <i class="fas fa-question-circle text-blue-500 mr-2"></i>
          ${title}
        </h3>
        <p class="text-gray-600 mb-6">${message}</p>
        <div class="flex justify-end space-x-3">
          <button id="cancelBtn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
            취소
          </button>
          <button id="confirmBtn" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            확인
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmBtn').onclick = () => {
      modal.remove();
      resolve(true);
    };
    document.getElementById('cancelBtn').onclick = () => {
      modal.remove();
      resolve(false);
    };
  });
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜시간 포맷팅
 */
function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 전화번호 포맷팅
 */
function formatPhone(phone) {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

/**
 * 모달 열기
 */
function openModal(title, content, size = 'max-w-4xl') {
  const modal = document.createElement('div');
  modal.id = 'dynamicModal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl ${size} w-full my-8 transform transition-all">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
        <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600 transition">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      <div class="p-6" id="modalContent">
        ${content}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // 모달 외부 클릭 시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // 닫기 버튼
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);

  // ESC 키로 닫기
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return modal;
}

/**
 * 모달 닫기
 */
function closeModal() {
  const modal = document.getElementById('dynamicModal');
  if (modal) {
    modal.remove();
  }
}

/**
 * 상태 뱃지 HTML 생성
 */
function getStatusBadge(status, type = 'consultation') {
  const badges = {
    consultation: {
      waiting: '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">상담대기</span>',
      in_progress: '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">상담중</span>',
      completed: '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">상담완료</span>',
      cancelled: '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">취소</span>',
    },
    contract: {
      waiting: '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">계약대기</span>',
      in_progress: '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">진행중</span>',
      signature_waiting: '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">서명대기</span>',
      completed: '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">계약완료</span>',
      cancelled: '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">취소</span>',
    },
    installation: {
      waiting: '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">설치대기</span>',
      in_progress: '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">진행중</span>',
      completion_waiting: '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">완료대기</span>',
      completed: '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">설치완료</span>',
      cancelled: '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">취소</span>',
    }
  };

  return badges[type]?.[status] || `<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">${status}</span>`;
}

/**
 * 빈 상태 HTML
 */
function getEmptyState(message = '데이터가 없습니다.') {
  return `
    <div class="text-center py-12">
      <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500">${message}</p>
    </div>
  `;
}

/**
 * 드래그앤드롭 활성화
 */
function enableDragAndDrop(columns, onDrop) {
  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      column.classList.add('bg-blue-50');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('bg-blue-50');
    });

    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('bg-blue-50');

      const itemId = e.dataTransfer.getData('itemId');
      const newStatus = column.dataset.status;
      
      if (itemId && newStatus) {
        await onDrop(itemId, newStatus);
      }
    });
  });
}

/**
 * 디바운스
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
