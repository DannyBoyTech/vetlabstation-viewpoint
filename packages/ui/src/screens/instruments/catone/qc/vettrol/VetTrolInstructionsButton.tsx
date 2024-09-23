import { Button } from "@viewpoint/spot-react";
import { VetTrolInstructionsModal } from "./VetTrolInstructionsModal";
import { ReactNode, useState } from "react";
import { ButtonProps } from "@viewpoint/spot-react/src/components/button/Button";

interface VetTrolInstructionsButtonProps extends ButtonProps {
  secondaryHeaderContent: ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

/**
 * A button that shows a VetTrol instructions modal when clicked.
 *
 * Control of the modal is handled within this component.
 */
export function VetTrolInstructionsButton(
  props: VetTrolInstructionsButtonProps
) {
  const [open, setOpen] = useState(false);
  const { secondaryHeaderContent, onConfirm, ...buttonProps } = props;

  const handleClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true);
    props.onClick?.(ev);
  };

  const handleClose = () => {
    setOpen(false);
    props.onClose?.();
  };

  const handleConfirm = () => {
    setOpen(false);
    props.onConfirm?.();
  };

  return (
    <>
      <Button {...buttonProps} onClick={handleClick} />
      {open && (
        <VetTrolInstructionsModal
          secondaryHeaderContent={secondaryHeaderContent}
          open={open}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
