import { App, Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import { useState } from "react";
import type { FormProps } from "antd";
import { loginAPI, loginWithGoogleAPI } from "@/services/api";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useCurrentApp } from "@/contexts/app.context";

type FieldType = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const { message, notification } = App.useApp();
  const { setIsAuthenticated, setUser } = useCurrentApp();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { username, password } = values;
    setIsSubmit(true);
    const res = await loginAPI(username, password);
    setIsSubmit(false);
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
        const res = await loginWithGoogleAPI("GOOGLE", data.email);
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
      }
    }
  });

  return (
    <div className="login-layout">
      <div className="image-side">
        <img src="/images/logo.png" alt="login art" />
      </div>

      <div className="form-side">
        <Form
          name="login-form"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className="login-form"
        >
          <h2 className="login-title">WELCOME BACK</h2>
          <p className="login-subtitle">
            Welcome back! Please enter your details.
          </p>

          <Form.Item<FieldType>
            label="Email"
            name="username"
            rules={[
              { required: true, message: "Email cannot be blank!" },
              { type: "email", message: "Email is not in correct format!" }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password cannot be blank!" }]}
          >
            <Input.Password placeholder="**********" />
          </Form.Item>

          <div className="form-options">
            <label>
              <input type="checkbox" />
              <span> Remember me</span>
            </label>
            <Link to="/" className="forgot-link">
              Forgot password
            </Link>
          </div>

          <Form.Item>
            <Button
              htmlType="submit"
              loading={isSubmit}
              className="btn-primary"
            >
              Sign in
            </Button>
          </Form.Item>

          <div className="social-btn" onClick={() => loginGoogle()}>
            <img src="/images/google-logo.png" alt="Google" />
            <span>Continue with Google</span>
          </div>

          <div className="social-btn" onClick={() => loginGoogle()}>
            <img src="/images/facebook-logo.png" alt="Facebook" />
            <span>Continue with Facebook</span>
          </div>

          <p className="signup-text">
            Don’t have an account?{" "}
            <Link to="/" className="signup-link">
              Sign up for free!
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
