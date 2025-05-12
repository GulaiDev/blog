<template>
  <div class="comment-header">
    <span class="comment-author">{{ props.comment.author }}</span>
    <span class="comment-date">{{ formatDate(props.comment.created_at) }}</span>
  </div>
  <div class="comment-content">{{ props.comment.content }}</div>
</template>

<script setup>
import { formatDate } from "@/utils/formatDate";
const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.comment-header {
  margin-bottom: $spacing-xs;
  font-size: $font-size-sm;

  .comment-author {
    font-weight: bold;
    margin-right: $spacing-sm;
  }

  .comment-date {
    color: $text-light;
  }
}

.comment-content {
  margin-bottom: $spacing-sm;
  white-space: pre-wrap;
}
</style>
