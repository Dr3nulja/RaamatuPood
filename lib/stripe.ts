const stripe = {
  checkout: {
    sessions: {
      create: async (..._args:any[]) => ({ id: 'sess_stub', url: '' }),
      retrieve: async (..._args:any[]) => ({ id: 'sess_stub' }),
      update: async (..._args:any[]) => ({ id: 'sess_stub', url: '' })
    }
  },
  paymentIntents: {
    create: async (..._args:any[]) => ({ id: 'pi_stub' }),
    retrieve: async (..._args:any[]) => ({ id: 'pi_stub' })
  }
};

export default stripe;
export const checkout = stripe.checkout;
export const paymentIntents = stripe.paymentIntents;
