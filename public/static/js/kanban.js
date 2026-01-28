// ============================================================================
// MONKi Biz - 칸반보드 공통 JavaScript
// ============================================================================

/**
 * 칸반보드 초기화
 */
class KanbanBoard {
  constructor(config) {
    this.apiEndpoint = config.apiEndpoint;
    this.columns = config.columns; // [{ id, title, status, color }]
    this.onItemClick = config.onItemClick;
    this.onStatusChange = config.onStatusChange;
    this.renderCard = config.renderCard;
    this.containerId = config.containerId || 'kanbanBoard';
    this.data = {};
  }

  /**
   * 칸반보드 렌더링
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const columnsHtml = this.columns.map(column => `
      <div class="kanban-column bg-gray-50 rounded-xl p-4 min-h-[600px]" 
           data-status="${column.status}"
           style="flex: 1; min-width: 300px;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">
            ${column.title}
            <span class="ml-2 px-2 py-1 ${column.color} rounded-full text-xs" id="count-${column.status}">0</span>
          </h3>
        </div>
        <div class="kanban-items space-y-3" id="items-${column.status}">
          <!-- 카드들이 여기에 추가됩니다 -->
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="flex gap-4 overflow-x-auto pb-4">
        ${columnsHtml}
      </div>
    `;

    // 드래그앤드롭 활성화
    this.enableDragAndDrop();
  }

  /**
   * 데이터 로드
   */
  async loadData() {
    try {
      showLoading('데이터를 불러오는 중...');
      const response = await apiCall(this.apiEndpoint);
      hideLoading();

      if (response && response.success) {
        this.data = response.data;
        this.renderItems();
        return true;
      } else {
        showToast('데이터를 불러오는데 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      hideLoading();
      console.error('Load data error:', error);
      showToast('데이터 로드 중 오류가 발생했습니다.', 'error');
      return false;
    }
  }

  /**
   * 아이템 렌더링
   */
  renderItems() {
    this.columns.forEach(column => {
      const items = this.data[column.status] || [];
      const container = document.getElementById(`items-${column.status}`);
      const countEl = document.getElementById(`count-${column.status}`);

      if (countEl) {
        countEl.textContent = items.length;
      }

      if (!container) return;

      if (items.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-400">
            <i class="fas fa-inbox text-4xl mb-2"></i>
            <p class="text-sm">항목이 없습니다</p>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map(item => {
        const cardHtml = this.renderCard ? this.renderCard(item) : this.defaultRenderCard(item);
        return `
          <div class="kanban-card bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer p-4 border border-gray-200"
               draggable="true"
               data-id="${item.id}"
               onclick="window.kanban.handleItemClick(${item.id})">
            ${cardHtml}
          </div>
        `;
      }).join('');

      // 드래그 이벤트 추가
      container.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('itemId', card.dataset.id);
          card.classList.add('opacity-50');
        });

        card.addEventListener('dragend', (e) => {
          card.classList.remove('opacity-50');
        });
      });
    });
  }

  /**
   * 기본 카드 렌더링
   */
  defaultRenderCard(item) {
    return `
      <div class="text-sm">
        <h4 class="font-semibold text-gray-800 mb-1">${item.customer_name || item.phone || '이름 없음'}</h4>
        <p class="text-gray-600 text-xs">${item.phone || '-'}</p>
        ${item.region ? `<p class="text-gray-500 text-xs mt-1"><i class="fas fa-map-marker-alt mr-1"></i>${item.region}</p>` : ''}
      </div>
    `;
  }

  /**
   * 아이템 클릭 핸들러
   */
  handleItemClick(itemId) {
    if (this.onItemClick) {
      this.onItemClick(itemId);
    }
  }

  /**
   * 드래그앤드롭 활성화
   */
  enableDragAndDrop() {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(column => {
      const itemsContainer = column.querySelector('.kanban-items');

      itemsContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        column.classList.add('bg-blue-100');
      });

      itemsContainer.addEventListener('dragleave', () => {
        column.classList.remove('bg-blue-100');
      });

      itemsContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        column.classList.remove('bg-blue-100');

        const itemId = e.dataTransfer.getData('itemId');
        const newStatus = column.dataset.status;

        if (itemId && newStatus) {
          await this.changeStatus(parseInt(itemId), newStatus);
        }
      });
    });
  }

  /**
   * 상태 변경
   */
  async changeStatus(itemId, newStatus) {
    try {
      showLoading('상태를 변경하는 중...');
      
      const response = await apiCall(`${this.apiEndpoint}/${itemId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      hideLoading();

      if (response && response.success) {
        showToast('상태가 변경되었습니다.', 'success');
        
        if (this.onStatusChange) {
          await this.onStatusChange(itemId, newStatus);
        }
        
        await this.loadData();
      } else {
        showToast(response?.error || '상태 변경에 실패했습니다.', 'error');
      }
    } catch (error) {
      hideLoading();
      console.error('Change status error:', error);
      showToast('상태 변경 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 새로고침
   */
  async refresh() {
    await this.loadData();
  }
}

/**
 * 폼 데이터를 객체로 변환
 */
function formToObject(formElement) {
  const formData = new FormData(formElement);
  const obj = {};
  
  for (const [key, value] of formData.entries()) {
    // 숫자 타입 자동 변환
    if (!isNaN(value) && value !== '') {
      obj[key] = Number(value);
    } else {
      obj[key] = value;
    }
  }
  
  return obj;
}

/**
 * 객체를 폼에 채우기
 */
function objectToForm(obj, formElement) {
  Object.keys(obj).forEach(key => {
    const input = formElement.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = !!obj[key];
      } else {
        input.value = obj[key] || '';
      }
    }
  });
}
