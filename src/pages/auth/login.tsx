import { App, Button, Divider, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import "./login.scss";
import { useState } from "react";
import type { FormProps } from "antd";
import { loginAPI, loginWithGoogleAPI } from "@/services/api";
import { GooglePlusOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useCurrentApp } from "@/contexts/app.context";

type FieldType = {
  phone: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const { message, notification } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { phone } = values;
    setIsSubmit(true);
    const res = await loginAPI(phone);
    setIsSubmit(false);
    if (res?.data) {
      setIsAuthenticated(true);
      setUser(res.data.user);
      localStorage.setItem("access_token", res.data.access_token);
      message.success("Đăng nhập tài khoản thành công!");
      navigate("/admin");
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description:
          res.message && Array.isArray(res.message)
            ? res.message[0]
            : res.message,
        duration: 5
      });
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const { data } = await axios(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse?.access_token}`
          }
        }
      );
      if (data && data.email) {
        //call backend create user
        const res = await loginWithGoogleAPI("GOOGLE", data.email);

        if (res?.data) {
          setIsAuthenticated(true);
          setUser(res.data.user);
          localStorage.setItem("access_token", res.data.access_token);
          message.success("Đăng nhập tài khoản thành công!");
          navigate("/");
        } else {
          notification.error({
            message: "Có lỗi xảy ra",
            description:
              res.message && Array.isArray(res.message)
                ? res.message[0]
                : res.message,
            duration: 5
          });
        }
      }
    }
  });

  return (
    <div className="login-page">
      <main className="main">
        <div className="container">
          <section className="wrapper">
            <div className="heading">
              <h2 className="text text-large" style={{ textAlign: "center" }}>
                ĐĂNG NHẬP
              </h2>
              <Divider style={{ borderColor: "#7cb305" }} />
            </div>
            <Form name="login-form" onFinish={onFinish} autoComplete="off">
              <Form.Item<FieldType>
                labelCol={{ span: 24 }}
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^(3|5|7|8|9)\d{8}$/,
                    message: "Số điện thoại không hợp lệ!"
                  }
                ]}
              >
                <Input addonBefore="+84" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item>
                <Button
                  style={{ width: "100%" }}
                  type="primary"
                  htmlType="submit"
                  loading={isSubmit}
                >
                  GỬI MÃ OTP
                </Button>
              </Form.Item>
              <Divider style={{ borderColor: "#7cb305" }}>
                HOẶC ĐĂNG NHẬP VỚI
              </Divider>
              <div
                onClick={() => loginGoogle()}
                title="Đăng nhập với tài khoản Google"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  textAlign: "center",
                  marginBottom: 25,
                  cursor: "pointer"
                }}
              >
                <GooglePlusOutlined style={{ fontSize: 30, color: "orange" }} />
              </div>
            </Form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
