<template>
    <v-app>
        <v-container fluid>
            <Table />
        </v-container>
        <!-- <drop class="drop" :class="{ over }" @dragover="over = true" @dragleave="over = false" @drop="handleDrop">
            <v-container fluid>
                <top-toolbar />
                <selection-table />
                <object-details />
            </v-container>
        </drop> -->
    </v-app>
</template>

<!-- no scope for app.vue, style defined here is global for the app asdasd-->
<style>
html,
body {
    overflow-y: auto !important;
    height: 100%;
}

.drop {
    height: 100%;
}

.drop.over {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-width: 2px !important;
    border-color: grey !important;
    border-style: dashed !important;
    border-radius: 5px !important;
}
</style>

<script>

import Table from './table.vue';

import { Constants } from "../js/Constants";

export default {
    components: {  Table },
    data: function () {
        return {
            over: false
        };
    },
    computed: {
    },
    watch: {},
    methods: {
        handleFilterChanged(filterText, column) {
            this.$refs.agGrid.api.setQuickFilter(filterText, column.field); // Set the quick filter for the specific column
        },
    },
    
   
};
</script>
