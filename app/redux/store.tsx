import {configureStore} from '@reduxjs/toolkit';
import {persistStore,persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import productReducer from './product';

const persistconfig = {
    key:'product',
    storage,
}

const persistedProductReducer = persistReducer(persistconfig, productReducer);

const store = configureStore({
    reducer: {  
        product: persistedProductReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;