import { notFound } from 'next/navigation'

/* Addresses with two or more parts that match nothing else. Without this, Next shows its own unstyled 404
   because the site layout is not the app's only root layout (docs/adr/0011). */
export default function Missing() {
  notFound()
}
