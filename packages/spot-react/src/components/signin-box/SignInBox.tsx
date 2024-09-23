import React, { HTMLAttributes, useState } from "react";
import { IdexxLogo, SpotIcon } from "@viewpoint/spot-icons";
import { Button } from "../button";
import { Input, Label } from "../forms";

export interface HeaderProps extends HTMLAttributes<HTMLDivElement> {}

const Header = (props: HeaderProps) => {
  return <div className="spot-signin__header" {...props} />;
};

const ImageHeader = ({ children, ...props }: HeaderProps) => {
  return (
    <Header {...props}>
      <div className="spot-signin__header-image">{children}</div>
    </Header>
  );
};

const DefaultHeader = (props: HeaderProps) => {
  return (
    <ImageHeader {...props}>
      <svg className="spot-signin__header-image--idexx">
        <title>IDEXX</title>
        <IdexxLogo />
      </svg>
    </ImageHeader>
  );
};

export interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  buttonText?: string;
  usernameText?: string;
  passwordText?: string;
  onSignIn?: (creds: { username: string; password: string }) => void;
  buttonDisabled?: boolean;
  inputDisabled?: boolean;
  errorMessage?: string;
  showSpinner?: boolean;
}

const Content = ({
  buttonText = "Sign In",
  usernameText = "Username",
  passwordText = "Password",
  onSignIn,
  buttonDisabled,
  inputDisabled,
  errorMessage,
  showSpinner,
  ...props
}: ContentProps) => {
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handleKeyPress = (event: any) => {
    if (
      event.key === "Enter" &&
      username &&
      username.length > 0 &&
      password &&
      password?.length > 0
    ) {
      onSignIn?.({ username, password });
    }
  };
  return (
    <div className="spot-signin__content" {...props}>
      {errorMessage && (
        <div className="spot-signin__content-error" style={{ width: "100%" }}>
          <div
            className="spot-signin__content-error-message"
            style={{ width: "100%", display: "flex", alignItems: "center" }}
          >
            <svg className="spot-signin__content-error-message-icon">
              <SpotIcon name={"alert-notification"} />
            </svg>
            <span className="spot-signin__content-error-message-label">
              {errorMessage}
            </span>
          </div>
        </div>
      )}
      <div className="spot-form">
        <div className="spot-form__field-group">
          <Label>{usernameText}</Label>
          <Input
            disabled={inputDisabled}
            type="text"
            onChange={(ev) => setUsername(ev.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="spot-form__field-group">
          <Label>{passwordText}</Label>
          <Input
            disabled={inputDisabled}
            type="password"
            onChange={(ev) => setPassword(ev.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button
          onClick={() =>
            onSignIn?.({ username: username!, password: password! })
          }
          disabled={
            buttonDisabled ||
            !username ||
            !password ||
            username.length === 0 ||
            password.length === 0
          }
          spinIcon={showSpinner}
          rightIcon={showSpinner ? "spinner" : undefined}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export interface FooterProps extends HTMLAttributes<HTMLDivElement> {}

const Footer = (props: FooterProps) => {
  return <div className="spot-signin__footer" {...props} />;
};

export interface DefaultFooterProps extends FooterProps {
  registerText: string;
  forgotPasswordText: string;
  helpText: string;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  onHelp?: () => void;
}

const DefaultFooter = ({
  onForgotPassword,
  onRegister,
  onHelp,
  forgotPasswordText,
  registerText,
  helpText,
  ...props
}: DefaultFooterProps) => {
  return (
    <Footer {...props}>
      <Button buttonType="link" onClick={() => onForgotPassword?.()}>
        {forgotPasswordText}
      </Button>
      <span className="spot-signin__footer-item-separator" />
      <Button buttonType="link" onClick={() => onRegister?.()}>
        {registerText}
      </Button>
      <span className="spot-signin__footer-item-separator" />
      <Button buttonType="link" onClick={() => onHelp?.()}>
        {helpText}
      </Button>
    </Footer>
  );
};

export const SignInBox = (props: HTMLAttributes<HTMLDivElement>) => {
  return <div className="spot-signin" {...props} />;
};

SignInBox.Footer = Footer;
SignInBox.DefaultFooter = DefaultFooter;
SignInBox.Header = Header;
SignInBox.ImageHeader = ImageHeader;
SignInBox.DefaultHeader = DefaultHeader;
SignInBox.Content = Content;

export default SignInBox;
