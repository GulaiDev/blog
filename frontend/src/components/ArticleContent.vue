<template>
  <div class="form-group">
    <label for="title">标题</label>
    <input
      type="text"
      id="title"
      v-model="props.form.title"
      required
      placeholder="请输入文章标题"
    />
  </div>

  <div class="form-group">
    <label for="content">内容</label>
    <textarea
      id="content"
      v-model="props.form.content"
      required
      placeholder="请输入文章内容"
      rows="15"
    ></textarea>
  </div>
</template>

<script setup>
const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
});
</script>
