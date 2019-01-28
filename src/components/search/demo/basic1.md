```vue
<template>
  <search 
    ref="search"
    :disabled = "disabled"
    @search="doSearch" >
  </search>
</template>
<script>
import { Search } from 'bview'
export default {
    components: {
        Search
    },
    data() {
        return {
            disabled:false
        }
    },
    methods: {
        doSearch(value){
            console.log('doSearch' + value);
        }
    }
};
</script>
```

