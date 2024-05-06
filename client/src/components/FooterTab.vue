<script setup>
import { useRouter } from 'vue-router';
// Routerのインスタンスをインポートして、現在のルートを取得

const router = useRouter();
</script>

<template>
  <footer
    class="font-en w-[600px] rounded-3xl fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-dark shadow-md flex justify-around items-center"
  >
    <nav class="flex justify-between items-center max-w-screen-xl mx-auto px-[2.75rem] py-[0.6rem]">
      <router-link to="/" class="tab" :class="{ active: $route.path === '/' }">
        <div class="icon-container">
          <svg
            id="HomeIcon"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            :class="['icon', { 'icon-active': $route.path === '/' }]"
            alt="Home"
          >
            <path
              id="HomeIcon-2"
              data-name="HomeIcon"
              d="M1242,1821h6a1,1,0,0,0,1-1v-14h4a1,1,0,0,0,.707-1.707l-15-15a1,1,0,0,0-1.414,0l-15,15A1,1,0,0,0,1223,1806h4v14a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1v-7h6v7A1,1,0,0,0,1242,1821Zm-8-10a1,1,0,0,0-1,1v7h-4v-14a1,1,0,0,0-1-1h-2.586L1238,1791.414,1250.582,1804H1248a1,1,0,0,0-1,1v14h-4v-7a1,1,0,0,0-1-1Z"
              transform="translate(-1221.996 -1789)"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="text-xs">Home</span>
      </router-link>
      <router-link to="/account" class="tab" :class="{ active: $route.path === '/account' }">
        <div class="icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="28"
            viewBox="0 0 32 28"
            class="icon"
            :class="['icon', { 'icon-active': $route.path === '/account' }]"
            alt="Account"
          >
            <path
              id="_58"
              data-name="58"
              d="M1080,812a1,1,0,0,1-.949-1.317l2-6a1,1,0,0,1,.674-.645l7-2a1,1,0,0,1,.722.067l5.553,2.777,5.553-2.777a1,1,0,0,1,.722-.067l7,2a1,1,0,0,1,.674.645l2,6A1,1,0,0,1,1110,812Zm2.781-6.184L1081.385,810h27.225l-1.395-4.184-6.119-1.748-5.652,2.826a1,1,0,0,1-.895,0l-5.652-2.826ZM1087.5,793.5c0-5.239,3.364-9.5,7.5-9.5s7.5,4.262,7.5,9.5-3.364,9.5-7.5,9.5S1087.5,798.739,1087.5,793.5Zm2,0c0,4.065,2.518,7.5,5.5,7.5s5.5-3.434,5.5-7.5-2.519-7.5-5.5-7.5S1089.5,789.435,1089.5,793.5Z"
              transform="translate(-1078.997 -784.001)"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="text-xs">Account</span>
      </router-link>
      <router-link to="/diary" class="tab" :class="{ active: $route.path === '/diary' }">
        <div class="icon-container">
          <svg
            id="DiaryIcon"
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="32"
            viewBox="0 0 25 32"
            class="icon"
            :class="['icon', { 'icon-active': $route.path === '/diary' }]"
            alt="Diary"
          >
            <path
              id="DiaryIcon-2"
              data-name="DiaryIcon"
              d="M368.006,1244h19a2,2,0,0,0,2-2v-28a2,2,0,0,0-2-2h-19a2,2,0,0,0-2,2v3h-1a1,1,0,1,0,0,2h1v2h-1a1,1,0,1,0,0,2h1v2h-1a1,1,0,1,0,0,2h1v2h-1a1,1,0,1,0,0,2h1v2h-1a1,1,0,1,0,0,2h1v2h-1a1,1,0,1,0,0,2h1v3A2,2,0,0,0,368.006,1244Zm19-2h-4v-28h4Zm-19-7h1a1,1,0,0,0,0-2h-1v-2h1a1,1,0,0,0,0-2h-1v-2h1a1,1,0,0,0,0-2h-1v-2h1a1,1,0,0,0,0-2h-1v-2h1a1,1,0,0,0,0-2h-1v-3h13v28h-13v-3h1a1,1,0,0,0,0-2h-1Z"
              transform="translate(-364.006 -1212)"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="text-xs">Diary</span>
      </router-link>
      <router-link to="/dico" class="tab" :class="{ active: $route.path === '/dico' }">
        <div class="icon-container">
          <svg
            id="Dico"
            xmlns="http://www.w3.org/2000/svg"
            width="27"
            height="32"
            viewBox="0 0 27 32"
            class="icon"
            :class="['icon', { 'icon-active': $route.path === '/dico' }]"
            alt="Dico"
          >
            <line
              id="線_7"
              data-name="線 7"
              y2="7"
              transform="translate(0.5 20.5)"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            />
          <g id="合体_2" data-name="合体 2" fill="none">
              <path
                d="M4,32a4,4,0,0,1-2.28-7.287A3,3,0,0,1,0,22V3A3,3,0,0,1,3,0H24a3,3,0,0,1,3,3V22a3,3,0,0,1-3,3H23v7Z"
                stroke="none"
              />
              <path
                d="M 21.00040054321289 30.00040054321289 L 21.00040054321289 23.00020027160645 L 24.00029945373535 23.00020027160645 C 24.55154037475586 23.00020027160645 25 22.55133056640625 25 21.99959945678711 L 25 2.999700307846069 C 25 2.448460340499878 24.55154037475586 2.000000238418579 24.00029945373535 2.000000238418579 L 2.99970006942749 2.000000238418579 C 2.448460102081299 2.000000238418579 2 2.448460340499878 2 2.999700307846069 L 2 21.99959945678711 C 2 22.38511085510254 2.225430011749268 22.74081993103027 2.574320077896118 22.90582084655762 L 5.698060035705566 24.38313102722168 L 2.861059904098511 26.35585975646973 C 2.321890115737915 26.73077011108398 2 27.34536933898926 2 27.99990081787109 C 2 29.10297966003418 2.897020101547241 30.00040054321289 3.999599933624268 30.00040054321289 L 21.00040054321289 30.00040054321289 M 23.00040054321289 32.00040054321289 L 3.999599933624268 32.00040054321289 C 1.791000008583069 32.00040054321289 -1.77635683940025e-15 30.20940017700195 -1.77635683940025e-15 27.99990081787109 C -1.77635683940025e-15 26.6387996673584 0.6802999973297119 25.43626976013184 1.719259977340698 24.71381950378418 C 0.7030400037765503 24.23322105407715 -1.77635683940025e-15 23.19839096069336 -1.77635683940025e-15 21.99959945678711 L -1.77635683940025e-15 2.999700307846069 C -1.77635683940025e-15 1.342800259590149 1.34280002117157 2.716064386731887e-07 2.99970006942749 2.716064386731887e-07 L 24.00029945373535 2.716064386731887e-07 C 25.65719985961914 2.716064386731887e-07 27 1.342800259590149 27 2.999700307846069 L 27 21.99959945678711 C 27 23.6564998626709 25.65719985961914 25.00020027160645 24.00029945373535 25.00020027160645 L 23.00040054321289 25.00020027160645 L 23.00040054321289 32.00040054321289 Z"
                stroke="none"
                fill="currentColor"
              />
          </g>
            <line
              id="線_6"
              data-name="線 6"
              x2="4"
              transform="translate(23 31)"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
            <line
              id="線_8"
              data-name="線 8"
              x2="20"
              transform="translate(2.5 24)"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
            <text id="a" transform="translate(6 12)" fill="currentColor" font-size="13" font-family="ArialMT, Arial">
              <tspan x="0" y="0">a</tspan>
            </text>
            <text
              id="あ"
              transform="translate(13 20)"
              fill="currentColor"
              font-size="9"
              font-family="HiraginoSans-W3, Hiragino Sans"
            >
              <tspan x="0" y="0">あ</tspan>
            </text>
          </svg>
        </div>
        <span class="text-xs">Dico</span>
      </router-link>
      <router-link to="/feed" class="tab" :class="{ active: $route.path === '/feed' }">
        <div class="icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23.999"
            height="32"
            viewBox="0 0 23.999 32"
            class="icon"
            :class="['icon', { 'icon-active': $route.path === '/feed' }]"
            alt="Feed"
          >
            <path
              id="_82"
              data-name="82"
              d="M225.008,1244a2,2,0,0,1-2-2v-21a3.749,3.749,0,0,1,1-2.415l5.586-5.585a3.746,3.746,0,0,1,2.414-1h13a2,2,0,0,1,2,2v28a2,2,0,0,1-2,2Zm0-2h20v-28h-13v5a2,2,0,0,1-2,2h-5Zm1.414-23h3.586v-3.586Zm2.586,21a1,1,0,1,1,0-2h12a1,1,0,1,1,0,2Zm0-5a1,1,0,0,1,0-2h12a1,1,0,0,1,0,2Zm0-5a1,1,0,0,1,0-2h12a1,1,0,0,1,0,2Zm0-5a1,1,0,0,1,0-2h12a1,1,0,0,1,0,2Zm6-5a1,1,0,0,1,0-2h6a1,1,0,0,1,0,2Z"
              transform="translate(-223.008 -1212)"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="text-xs">Feed</span>
      </router-link>
      <router-link to="/editme" class="tab" :class="{ active: $route.path === '/editme' }">
        <div class="icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25.711"
            height="25.698"
            viewBox="0 0 25.711 25.698"
            class="icon"
            :class="['icon', { 'icon-active': $route.path === '/editme' }]"
            alt="Edit me"
          >
            <path
              id="_81"
              data-name="81"
              d="M72.67,1238.53a1.5,1.5,0,0,0,.608-.14l5.9-2.621a6.069,6.069,0,0,0,1.579-1.085l16.1-16.1a1.646,1.646,0,0,0,0-2.325l-2.948-2.948a1.646,1.646,0,0,0-2.324,0l-16.51,16.51a5.694,5.694,0,0,0-1.073,1.61l-2.251,5.467a1.212,1.212,0,0,0,.053,1.181A1.027,1.027,0,0,0,72.67,1238.53Zm6.921-5.009h0l-2.948-2.948,13.633-13.634,2.948,2.948Zm13.152-19.047,2.948,2.948-1.3,1.3-2.948-2.948Zm-17.226,17.584c.024-.058.057-.125.093-.193l2.554,2.554-4.429,1.967Z"
              transform="translate(-71.622 -1212.831)"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="text-xs">Edit me</span>
      </router-link>
    </nav>
  </footer>
</template>

<style scoped>
.tab {
  /* 各タブの共通のスタイル */
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  /* height: 60px; */
  margin-right: 28px; /* 最後のタブ以外に適用 */
  text-decoration: none;
  color: var(--custom-ivory);
}

.tab:last-child {
  margin-right: 0; /* 最後のタブの右マージンを取り除く */
}

.tab.active {
  /* アイボリーの四角形スタイル */
  background-color: rgba(239, 237, 232, 0.7);
  border-radius: 15px;
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.icon {
  fill: currentColor;
}

.active .icon {
  color: var(--custom-dark);
}

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* アイコンとテキストを垂直方向に中央揃えに */
  height: 32px;
  transition: transform 0.3s ease;
}

.icon-container:hover {
  transform: scale(1.05);
}

/* アイコンの下のテキスト */
.tab span {
  font-size: 0.75rem;
  margin-top: 4.5px; /* アイコンとの間隔 */
  color: var(--custom-ivory);
}

.tab.active span {
  color: var(--custom-dark);
}
</style>
