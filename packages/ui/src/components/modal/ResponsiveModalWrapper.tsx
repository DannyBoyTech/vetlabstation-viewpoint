import styled from "styled-components";

export const ResponsiveModalWrapper = styled.div`
  display: contents;
  /** Don't restrict width **/

  .spot-modal {
    max-width: unset;
    width: auto;
  }

  /** Let the modal body grow to full size **/

  .spot-modal__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }

  /** Let the modal body content grow to full size, but not greater than the parent to contain the image **/

  .spot-modal__content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }

  .spot-modal__copy {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }
`;
