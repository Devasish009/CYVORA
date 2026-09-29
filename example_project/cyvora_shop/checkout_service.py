class PaymentService:
    def process_payment(self, payload):
        if not payload or "amount" not in payload:
            return None
        return {"status": "SUCCESS", "transaction_id": "tx_998811"}

class CheckoutService:
    def __init__(self):
        self.payment_service = PaymentService()

    def checkout(self, cart_item, payment_payload):
        # Simulates Bug #1: Unsafe property access on potentially None response
        res = self.payment_service.process_payment(payment_payload)
        return {"item": cart_item, "status": res["status"], "tx_id": res["transaction_id"]}
