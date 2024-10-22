"use client";

import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  s1?: boolean;
  s2?: boolean;
  s3?: boolean;
  s4?: boolean;
  s5?: boolean;
}

const ButtonVar: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon,
  s1,
  s2,
  s3,
  s4,
  s5,
}) => {
  if (s1) {
    return (
      <button disabled={disabled} onClick={onClick} className="s1">
        {Icon && (
          <Icon
            size={24}
            className="
              absolute
              left-4
              top-3
            "
          />
        )}
        {label}
      </button>
    );
  }
  if (s2) {
    return (
      <button disabled={disabled} onClick={onClick} className="s2  w-full">
        {Icon && (
          <Icon
            size={24}
            className="
              absolute
              left-4
             
              top-3
            "
          />
        )}
        {label}
      </button>
    );
  }
  if (s3) {
    return (
      <button disabled={disabled} onClick={onClick} className="s3 w-full">
        {Icon && (
          <Icon
            size={24}
            className="
              absolute
              left-4
              top-3
            "
          />
        )}
        {label}
      </button>
    );
  }
  if (s4) {
    return (
      <button disabled={disabled} onClick={onClick} className="s4">
        {Icon && (
          <Icon
            size={24}
            className="
              absolute
              left-4
              top-3
            "
          />
        )}
        {label}
      </button>
    );
  }
  if (s5) {
    return (
      <button disabled={disabled} onClick={onClick} className="s5 ">
        {Icon && (
          <Icon
            size={24}
            className="
              absolute
              left-4
              top-3
            "
          />
        )}
        {label}
      </button>
    );
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        w-full
        ${outline ? "bg-white" : "bg-rose-500"}
        ${outline ? "border-black" : "border-rose-500"}
        ${outline ? "text-black" : "text-white"}
        ${small ? "text-sm" : "text-md"}
        ${small ? "py-1" : "py-3"}
        ${small ? "font-light" : "font-semibold"}
        ${small ? "border-[1px]" : "border-2"}
      `}
    >
      {Icon && (
        <Icon
          size={24}
          className="
            absolute
            left-4
            top-3
          "
        />
      )}
      {label}
    </button>
  );
};

export default ButtonVar;
