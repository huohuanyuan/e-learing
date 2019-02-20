import Vue from 'vue';
import Vuex from 'vuex';

// vuex
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        userRole:""
    },
    mutations: {
        setUserRole(state,data){
            state.userRole = data
        }
    },
    actions: {

    },
  
})

export default store;