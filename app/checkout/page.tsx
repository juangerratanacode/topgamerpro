import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Finalizar pedido</h1>
      <CheckoutForm />
    </div>
  );
}
