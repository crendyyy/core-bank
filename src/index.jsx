import React from "react";
import ReactDOM from "react-dom/client";
import routes from "./routes/index";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { UserProvider } from "./components/context/userContext";
import { App, ConfigProvider } from "antd";

const router = createBrowserRouter(routes);

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
            borderRadius: "4px",
          },
        }}
      >
        <App>
          <UserProvider>
            <RouterProvider router={router} />
          </UserProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
