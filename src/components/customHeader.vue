<template>
    <div>
        <input type="text" v-model="filterText" placeholder="Search..." @input="filterChanged" />
    </div>
</template>

<script>
export default {
    name: 'CustomHeaderComponent',
    data() {
        return {
            filterText: '', // Add a filterText property to store the search text for the column
        };
    },
    methods: {
        filterChanged() {
            // Emit a custom event with the filter text when it changes
            this.$emit('filter-changed', this.filterText);
        },
    },
};
</script>
