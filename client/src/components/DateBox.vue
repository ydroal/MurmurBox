<script setup>
import { ref, onMounted } from 'vue';

const formattedDate = ref('');
const formattedWeekday = ref('');

onMounted(() => {
  const today = new Date();
  const dateOptions = { day: 'numeric', month: 'numeric' };
  const weekdayOptions = { weekday: 'short' };

  // 日付をフランスのフォーマットで取得
  const dateFR = new Intl.DateTimeFormat('fr-FR', dateOptions).format(today).split('/');
  // 日付の配列を逆にして、整数に変換してから結合する
  formattedDate.value = `${parseInt(dateFR[1], 10)}.${parseInt(dateFR[0], 10)}`;

  // 曜日を取得して不要なピリオドを除去する
  const weekdayFR = new Intl.DateTimeFormat('fr-FR', weekdayOptions).format(today);
  formattedWeekday.value = '/ ' + weekdayFR.slice(0, -1);
});
</script>

<template>
  <div class="date-box">
    <div class="date-box-top">
      <p>Date</p>
    </div>
    <div class="date-box-bottom">
      <strong>{{ formattedDate }}</strong>
      <span>{{ formattedWeekday }}</span>
    </div>
  </div>
</template>

<style scoped>
.date-box {
  position: relative;
  width: 66px;
  height: 86px;
  border: 1px solid var(--custom-dark);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-family: Arial, sans-serif;
  color: var(--custom-dark);
  padding-top: 0.375rem;
}
.date-box-top {
  position: relative;
  width: 100%;
  font-size: 15px;
  border-bottom: 1px solid var(--custom-dark);
  height: 30%;
}

.date-box-bottom {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.date-box-bottom strong {
  flex: 0 1 auto;
  font-size: 21px;
  font-weight: bold;
}

.date-box-bottom span {
  margin-top: -12px;
  flex: 0 1 auto;
  font-size: 18px;
}
</style>
