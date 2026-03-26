export default function CheckOutsideClick(e, state, setState, ref) {
  if (state && ref.current && !ref.current.contains(e.target)) {
    setState(false)
  }
}
