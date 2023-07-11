<template>
    <div>
        <div class="d-flex align-center">
            <v-btn
                elevation="0"
                class="ma-1 mr-2 white--text"
                :color="primaryColor"
                @click="clearTable"
            >
                <v-icon class="pr-2" color="white">mdi-delete</v-icon>Clear
            </v-btn>
            <v-text-field
                v-model="searchText"
                class="ma-1 shrink"
                clearable
                flat
                dense
                hide-details
                outlined
                prepend-inner-icon="mdi-magnify"
                placeholder="Filter View"
            />
        </div>
    </div>
</template>

<style>
</style>

<script>
import { mapState } from "vuex";

export default {
  components: { },
  data () {
      return {
          primaryColor: "#42a2da"
      };
    },
    computed: {
        searchText: {
            get() {
                return this.$store.state.searchText;
            },
            set(text) {
                this.$store.commit("searchText", text);
            }
        },
        ...mapState(["loading"])
    },
    watch: {
    },
    mounted () {
    },
    methods: {
        clearTable() {
            this.$store.commit("clearSelections");
        }
    }
};
</script>
