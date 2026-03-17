import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "store";
import { Project } from "screens/project-list/list";
import { User } from "screens/project-list/search-panel";

/**
 * RTK 背后做了三件事：
 * 1. 自动生成 Action Type（信号名称）
 * 2. 自动生成 Action Creator（信号发射器）
 * 3. 自动关联 Reducer（处理逻辑）
 */

interface State {
  projectModalOpen: boolean;
  projects: Project[];
  user: User | null;
}

const initialState: State = {
  projectModalOpen: false,
  projects: [],
  user: null,
};

export const projectListSlice = createSlice({
  name: "projectListSlice", // name会作为 actionType 的前缀
  initialState,
  reducers: {
    /*
      看起开像在直接修改：
      state.projectModalOpen = true;
      实际上等价于（Immer 帮你生成）：
      return {
        ...state,
        projectModalOpen: true
      };
      只有集成了 Immer 才能这么写，普通的redux做不到这一点
    */
    openProjectModal(state) {
      state.projectModalOpen = true;
    },
    closeProjectModal(state) {
      state.projectModalOpen = false;
    },
    setProjectList(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
});

const { setProjectList } = projectListSlice.actions;

export const refreshProjects = (promise: Promise<Project[]>) => (
  dispatch: AppDispatch
) => {
  promise.then((projects) => dispatch(setProjectList(projects)));
};

// 导出 action creator
export const projectListActions = projectListSlice.actions;

export const selectProjectModalOpen = (state: RootState) =>
  state.projectList.projectModalOpen;
