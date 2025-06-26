const DraggableEditor = {
  template: `
    <div class="container mx-auto p-4">
      <div class="flex gap-2 mb-4">
        <button @click="addBlock" class="px-4 py-2 bg-blue-500 text-white rounded">添加</button>
        <button @click="importConfig" class="px-4 py-2 bg-green-500 text-white rounded">导入</button>
        <button @click="exportConfig" class="px-4 py-2 bg-purple-500 text-white rounded">导出</button>
        <button @click="exportHTML" class="px-4 py-2 bg-orange-500 text-white rounded">编译导出</button>
      </div>

      <div class="relative min-h-[200px]">
        <div 
          v-for="(block, index) in blocks" 
          :key="index"
          class="float-left cursor-move m-2"
          :style="{ 'margin-left': block.x + 'px', 'margin-top': block.y + 'px' }"
          @dblclick="editBlock(index)"
          draggable="true"
          @dragstart="dragStart($event, index)"
          @dragend="dragEnd($event, index)"
        >
          <div v-html="block.content"></div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      blocks: [],
      draggedIndex: null,
      startX: 0,
      startY: 0
    }
  },

  methods: {
    addBlock() {
      const html = prompt('请输入HTML代码:', '<div>新块</div>');
      if (html) {
        this.blocks.push({
          content: html,
          x: 20,
          y: 20
        });
      }
    },

    editBlock(index) {
      const newHtml = prompt('编辑HTML:', this.blocks[index].content);
      if (newHtml) {
        this.blocks[index].content = newHtml;
      }
    },

    dragStart(e, index) {
      this.draggedIndex = index;
      this.startX = e.clientX - this.blocks[index].x;
      this.startY = e.clientY - this.blocks[index].y;
    },

    dragEnd(e, index) {
      this.blocks[index].x = e.clientX - this.startX;
      this.blocks[index].y = e.clientY - this.startY;
    },

    exportConfig() {
      const data = JSON.stringify(this.blocks);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocks-config.json';
      a.click();
      
      URL.revokeObjectURL(url);
    },

    importConfig() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
          try {
            this.blocks = JSON.parse(event.target.result);
          } catch (error) {
            alert('导入失败: 文件格式不正确');
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    },

    exportHTML() {
      if (this.blocks.length === 0) return;
      
      // 获取页面尺寸作为基准
      const pageWidth = window.innerWidth || document.documentElement.clientWidth;
      const pageHeight = window.innerHeight || document.documentElement.clientHeight;
      
      let htmlOutput = '';
      this.blocks.forEach(block => {
        const processed = block.content;
        // 转换为百分比位置
        htmlOutput += `<div style="position: absolute; margin-left: ${block.x+15}px; margin-top: ${block.y+70}px">${processed}</div>\n`;
      });
      
      const blob = new Blob([htmlOutput], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported-blocks.txt';
      a.click();
      
      URL.revokeObjectURL(url);
    },
    
  }
};
