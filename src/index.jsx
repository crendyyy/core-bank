import React from "react";
import ReactDOM from "react-dom/client";
import routes from "./routes/index";
import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { UserProvider } from "./components/context/userContext";
import "react-toastify/dist/ReactToastify.css";
import { App, ConfigProvider } from "antd";
import DynamicRoutes from "./routes/index";
import { NavigationProvider } from "./components/context/NavigationContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#2283F8",
            colorBgContainer: "#ffffff",
            fontFamily: "Inter",
            borderRadius: "8px",
          },
        }}
      >
        <App>
          <UserProvider>
            <NavigationProvider>
              <BrowserRouter>
                <DynamicRoutes />
              </BrowserRouter>
            </NavigationProvider>
          </UserProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
