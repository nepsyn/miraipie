<template>
  <div class="container">
    <div class="header">
      <span>聊天记录</span>
    </div>
    <div class="message" :class="message.fromBot ? 'message-from-bot' : ''" v-for="(message, index) in messages" :key="index">
      <div class="avatar-box">
        <img class="avatar" :src="message.avatar" alt="未加载的头像">
      </div>
      <template v-if="message.type === 'Image'">
        <img class="image" :src="message.content" alt="未加载的图片">
      </template>
      <template v-else>
        <div class="plain" :class="message.fromBot ? 'plain-from-bot' : 'plain-from-others'" v-text="message.content"></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  props: {
    messages: Array
  }
}
</script>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background-color: rgb(234,237,244);
    padding: 16px 20px;
  }

  .header {
    width: 100%;
    text-align: center;
    font-size: 14px;
    margin-bottom: 24px;
  }

  .message {
    width: 100%;
    display: flex;
    margin: 4px 0;
  }

  .message-from-bot {
    flex-direction: row-reverse;
  }

  .avatar {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 20px;
  }

  .plain {
    display: flex;
    position: relative;
    margin: 0 20px;
    background-color: white;
    border-radius: 8px;
    padding: 8px 12px;
    align-items: center;
    word-break: break-all;
    word-wrap: break-word;
  }

  .plain-from-bot {
    color: white;
    background-color: rgb(31,186,252);
  }

  .plain-from-bot:after {
    content: "";
    position: absolute;
    left: 100%;
    top: 0;
    width: 12px;
    height: 12px;
    border: 0 solid transparent;
    border-bottom-width: 8px;
    border-bottom-color: rgb(31,186,252);
    border-radius: 0 0 32px 0;
  }

  .plain-from-others:before {
    content: "";
    position: absolute;
    right: 100%;
    top: 0;
    width: 12px;
    height: 12px;
    border: 0 solid transparent;
    border-bottom-width: 8px;
    border-bottom-color: white;
    border-radius: 0 0 0 32px;
  }

  .image {
    border-radius: 12px;
    margin: 0 12px;
    max-width: 80% !important;
  }
</style>
