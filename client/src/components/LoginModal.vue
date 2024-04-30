<template>
  <div v-if="isOpen" class="flex items-center justify-center fixed top-0 left-0 w-full h-full bg-black095">
    <div class="flex flex-col w-2/5 h-[62%] overflow-hidden rounded-[20px] mt-[6%]">
      <div class="relative bg-ivory p-5 flex flex-1 flex-col items-center justify-start">
        <h1 class="mt-[7%] mb-[3%] font-title text-[1.9rem] font-normal text-[#1a1f39]">Welcome in MurmurBox.</h1>
        <p class="font-light text-sm leading-6 inline-block text-dark">
          To take full advantage of MurmurBox, please log in.
        </p>
        <img
          src="@/assets/images/logo.svg"
          alt="MurmurBox. Logo"
          class="absolute bottom-[0.5%] right-[0.5%] w-1/4 h-auto"
        />
      </div>
      <div class="bg-white p-5 flex flex-1 items-center justify-center">
        <div
          v-if="isOpen"
          id="g_id_onload"
          :data-client_id="googleClientId"
          data-context="signin"
          data-ux_mode="http://localhost:5173"
          data-login_uri="http://localhost:3000/api/auth/google"
          data-nonce=""
          data-auto_prompt="false"
        ></div>
        <div
          v-if="isOpen"
          class="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left"
        ></div>
      </div>
      <button
        class="absolute top-[0.3%] right-[0.3%] w-7 h-7 rounded-full bg-[#313539] text-[#f4f2f0] text-lg font-thin leading-7 text-center border-none cursor-pointer"
        @click="closeModal"
      >
        &#10005;
      </button>
    </div>
  </div>
</template>

<style scoped></style>
