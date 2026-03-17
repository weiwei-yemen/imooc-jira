import { User } from "screens/project-list/search-panel";
import { createSlice } from "@reduxjs/toolkit";
import * as auth from "auth-provider";
import { AuthForm, bootstrapUser } from "context/auth-context";
import { AppDispatch, RootState } from "store/index";

interface State {
  user: User | null;
}

const initialState: State = {
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
  },
});

const { setUser } = authSlice.actions;

// 这里使用selectUser是遵循了 Redux 的选择器模式，是一种规范
export const selectUser = (state: RootState) => state.auth.user;

// thunk 函数是内部的函数，thunk 会执行这个函数，然后把 dispatch 传给这个函数
export const login = (form: AuthForm) => (dispatch: AppDispatch) =>
  auth.login(form).then((user) => dispatch(setUser(user)));

export const register = (form: AuthForm) => (dispatch: AppDispatch) =>
  auth.register(form).then((user) => dispatch(setUser(user)));

export const logout = () => (dispatch: AppDispatch) =>
  auth.logout().then(() => dispatch(setUser(null)));

export const bootstrap = () => (dispatch: AppDispatch) =>
  bootstrapUser().then((user) => dispatch(setUser(user)));
