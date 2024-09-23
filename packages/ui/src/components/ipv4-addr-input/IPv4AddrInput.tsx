import styled from "styled-components";
import { MaskedInput } from "../input/MaskedInput";
import { Fragment, useMemo, useRef } from "react";
import { KeyboardEvent, MouseEvent } from "react";
import classNames from "classnames";
import { validIPv4OctetString } from "../../utils/ipv4-utils";
import { InputAware } from "../InputAware";

function nullOrEmpty(str?: string) {
  return str == null || str === "";
}

function ipv4String(octetStrs: string[]) {
  return octetStrs.join(".");
}

function parseIpv4(str?: string) {
  if (str == null) {
    return ["", "", "", ""];
  }

  const octetStrings = str
    .split(".")
    .map((it) => (validIPv4OctetString(it) ? it : ""));

  while (octetStrings.length < 4) {
    octetStrings.push("");
  }

  return octetStrings.slice(0, 4);
}

function focus(
  elem?: HTMLInputElement | null,
  options?: { selectAll?: boolean }
) {
  if (elem != null) {
    elem.focus();

    if (options?.selectAll) {
      elem.select();
    }
  }
}

const OctetInput = styled(MaskedInput)<{ octet?: number }>`
  width: 60px;
  display: inline;
  text-align: center;
  ${(p) => (p.octet ? `grid-area: oct${p.octet}` : "")}

  :has(> &) {
    display: inline;
  }
`;

const Root = styled.span`
  display: inline-grid;
  grid-template-areas: "oct0 . oct1 . oct2 . oct3";
  width: 275px;
  align-items: end;
`;

interface IPv4AddrInputProps {
  className?: string;
  "data-testid"?: string;

  value?: string;

  disabled?: boolean;

  /**
   * Auto-selects existing octet value on click, to speed up user edits.
   */
  autoSelectOctets?: boolean;

  /**
   *  A four-bit bit-mask representing which octets should be disabled when the
   *  disabled property is truthy. Octets corresponding to zero-valued bits are
   *  unaffected by the disable property.
   */
  disableMask?: number;

  onAddrChange?: (addr: string) => void;
  onValidAddr?: (addr: string) => void;

  /**
   * To add keypad by wrapping the input fields with InputAware
   */
  inputAware?: boolean;
}

/**
 *  An input form for IPv4 addresses
 * @param props
 * @returns
 */
const IPv4AddrInput = (props: IPv4AddrInputProps) => {
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const refs = [ref0, ref1, ref2, ref3];

  const octets = useMemo(() => parseIpv4(props.value), [props.value]);

  const classes = classNames(props.className, "ipv4-addr-input");

  function handleInputChange(value: string, _inputMask: any, ev?: InputEvent) {
    if (ev?.currentTarget instanceof Element) {
      const elem: Element = ev?.currentTarget;
      const octIdx = Number(elem.getAttribute("octet"));

      if (value !== octets[octIdx]) {
        const nextIpv4Addr = ipv4String(
          octets.map((it, i) => (i === octIdx ? value : it))
        );

        props.onAddrChange?.(nextIpv4Addr);

        if (value.length === 3 || Number(value) > 25) {
          if (octIdx < refs.length - 1) {
            refs[octIdx + 1].current?.select();
          }
        }
      }
    }
  }

  function handleInputClick(ev: MouseEvent<HTMLInputElement>) {
    //prevent user from having to backspace to replace octet
    focus(ev.currentTarget, { selectAll: props.autoSelectOctets });
  }

  function handleKeyDown(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev?.currentTarget instanceof Element) {
      const elem: Element = ev?.currentTarget;
      const octIdx = Number(elem.getAttribute("octet"));

      //backspace into previous cell
      if (ev.key === "Backspace" && octIdx > 0 && nullOrEmpty(octets[octIdx])) {
        focus(refs[octIdx - 1].current, {
          selectAll: props.autoSelectOctets,
        });
      }

      //ignore dots, unless it terminates the current octet
      if (
        ev.key === "." &&
        !nullOrEmpty(octets[octIdx]) &&
        octIdx < refs.length
      ) {
        if (octIdx < refs.length - 1)
          focus(refs[octIdx + 1]?.current, {
            selectAll: props.autoSelectOctets,
          });
      }
    }
  }

  return (
    <Root className={classes} data-testid={props["data-testid"]}>
      {refs.map((ref, i) => {
        const octectInput = (
          <OctetInput
            inputRef={ref}
            mask={validIPv4OctetString}
            octet={i}
            onAccept={handleInputChange}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            value={octets[i]}
            disabled={
              (props.disabled && props.disableMask == null) ||
              (props.disabled &&
                props.disableMask != null &&
                (props.disableMask & (0b1000 >>> i)) !== 0)
            }
          />
        );
        return (
          <Fragment key={i}>
            {i == 0 ? null : "."}
            {props.inputAware ? (
              <InputAware layout="numpad">{octectInput}</InputAware>
            ) : (
              octectInput
            )}
          </Fragment>
        );
      })}
    </Root>
  );
};

export type { IPv4AddrInputProps };
export { IPv4AddrInput };
