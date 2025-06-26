const { createApp, ref } = Vue;

// 主计算器应用
createApp({
  setup() {
    const input = ref({
      gain: 10,
      vref: 5,
      vdc: 2.5,
      fl: 16,
      gbw: 10,
      r1: 1,  // 新增R1输入
      r3: 4.99 // 新增R3输入
    });
    
    const results = ref({
      r1: 0,  // 改为从input获取
      r4: 0,
      r4Std: 0,
      r3: 0,  // 改为从input获取
      r2: 0,
      c1: 0,
      c1Std: 0,
      c2: 0,
      c2Std: 0,
      fh: 0
    });

    // Standard component values
    const standardValues = {
      resistors: [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 4.99, 5.6, 6.8, 8.2, 10],
      capacitors: [1, 1.5, 2.2, 3.3, 4.7, 6.8, 10, 15, 22, 33, 47, 68, 100]
    };

    // Find closest standard value
    const findClosestStandard = (value, type) => {
      const values = standardValues[type];
      return values.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    };

    // Format value with automatic unit scaling (supports any unit)
    const formatValue = (value, unit) => {
      const prefixes = [
        { scale: 1e12, prefix: 'T' },
        { scale: 1e9, prefix: 'G' },
        { scale: 1e6, prefix: 'M' },
        { scale: 1e3, prefix: 'k' },
        { scale: 1, prefix: '' },
        { scale: 1e-3, prefix: 'm' },
        { scale: 1e-6, prefix: 'μ' },
        { scale: 1e-9, prefix: 'n' },
        { scale: 1e-12, prefix: 'p' }
      ];
      
      const absValue = Math.abs(value);
      let bestMatch = prefixes[prefixes.length-1]; // Start with smallest scale
      
      // Find the largest scale where value >= scale
      for (const { scale, prefix } of prefixes) {
        if (absValue >= scale) {
          bestMatch = { scale, prefix };
          break; // Use first (largest) matching scale
        }
      }
      
      const scaledValue = value / bestMatch.scale;
      const fullUnit = bestMatch.prefix + unit;
      return {
        value: scaledValue,
        unit: fullUnit,
        str: `${scaledValue.toFixed(3)}${fullUnit}`
      };
    };

    const calculate = () => {
      // 1. Set R1 and R3 from user input
      results.value.r1 = input.value.r1;
      results.value.r3 = input.value.r3;

      // 2. Calculate R4 and standard value
      results.value.r4 = results.value.r1 * (input.value.gain - 1);
      results.value.r4Std = findClosestStandard(results.value.r4, 'resistors');

      // 3. Calculate R2
      results.value.r2 = (input.value.vref * input.value.r3 / input.value.vdc) - input.value.r3;

      // 3. Calculate C1
      const flDivisor = input.value.fl / 1.557;
      results.value.c1 = 1 / (2 * Math.PI * results.value.r1 * flDivisor) * 1e6; // Convert to μF
      results.value.c1Std = findClosestStandard(results.value.c1, 'capacitors');

      // 4. Calculate C2
      const rDiv = (results.value.r2 * results.value.r3) / (results.value.r2 + results.value.r3);
      results.value.c2 = 1 / (2 * Math.PI * rDiv * flDivisor) * 1e6; // Convert to μF
      results.value.c2Std = findClosestStandard(results.value.c2, 'capacitors');

      // 5. Calculate fH using user-specified GBW
      results.value.fh = input.value.gbw / input.value.gain;
    };

    // Auto-trigger calculate function every second
    setInterval(() => {
      calculate();
    }, 100);

    // Initial calculation
    calculate();

    return {
      input,
      results,
      calculate,
      formatValue
    };
  }
}).mount('#app');

// 拖拽编辑器应用
createApp({
  components: {
    'draggable-editor': DraggableEditor
  }
}).mount('#editor-app');
