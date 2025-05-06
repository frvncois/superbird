<template>
    <li class="input">
      <label>{{ label }}</label>
      <div>
        <ul data-type="select" ref="dropdown">
          <li @click="toggleOpen">
            <label>{{ hexValue || placeholder }}</label>
            <span
                class="preview"
                :style="{ backgroundColor: hexValue }"
              ></span>
          </li>
          <li>
              <canvas
                ref="canvas"
                width="200"
                height="150"
                @click="onCanvasClick"
              ></canvas>
          </li>
          <li>
            <input
                type="text"
                v-model="hexValue"
                :placeholder="hexValue"
                @input="onManualInput"
                class="hex-input"
              />
          </li>
        </ul>
      </div>
    </li>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const props = defineProps({
    label: String,
    placeholder: {
      type: String,
      default: '#FFFFFF',
    },
  });
  
  const dropdown = ref(null);
  const canvas = ref(null);
  const hexValue = ref('#ff0000');
  
  const toggleOpen = () => {
    const allDropdowns = document.querySelectorAll('ul[data-type="select"]');
    allDropdowns.forEach((ul) => {
      const items = ul.querySelectorAll('li:not(:first-child)');
      if (ul !== dropdown.value) {
        items.forEach((item) => {
          item.style.maxHeight = '0';
        });
        setTimeout(() => {
          ul.style.zIndex = '10';
        }, 10);
      }
    });
  
    if (!dropdown.value) return;
    const currentItems = dropdown.value.querySelectorAll('li:not(:first-child)');
    const isOpen = currentItems[0].style.maxHeight !== '0px' && currentItems[0].style.maxHeight !== '';
    currentItems.forEach(item => {
      item.style.maxHeight = isOpen ? '0' : item.scrollHeight + 'px';
    });
    dropdown.value.style.zIndex = isOpen ? '10' : '20';
  };
  
  const drawColorGradient = () => {
    const ctx = canvas.value.getContext('2d');
    const width = canvas.value.width;
    const height = canvas.value.height;
  
    const hueGrad = ctx.createLinearGradient(0, 0, width, 0);
    hueGrad.addColorStop(0, 'red');
    hueGrad.addColorStop(0.17, 'yellow');
    hueGrad.addColorStop(0.33, 'lime');
    hueGrad.addColorStop(0.5, 'cyan');
    hueGrad.addColorStop(0.67, 'blue');
    hueGrad.addColorStop(0.83, 'magenta');
    hueGrad.addColorStop(1, 'red');
    ctx.fillStyle = hueGrad;
    ctx.fillRect(0, 0, width, height);
  
    const whiteGrad = ctx.createLinearGradient(0, 0, 0, height);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    whiteGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
    whiteGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);
  };
  
  const onCanvasClick = (e) => {
    const rect = canvas.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.value.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    hexValue.value = rgbToHex(pixel[0], pixel[1], pixel[2]);
  };
  
  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  
  const onManualInput = (e) => {
    const val = e.target.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      hexValue.value = val;
    }
  };
  
  onMounted(() => {
    if (dropdown.value) dropdown.value.style.zIndex = '10';
    drawColorGradient();
  });
  </script>
  

  