import axios from 'axios';
import { showAlert } from './alerts';
try {
  const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
} catch (err) {
  console.log(err);
}

export const bookTour = async (tourId) => {
  try {
    //1) Get checkout session
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    location.assign(session.data.session.url);
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });

    //2)Automatccally create checkout form + charge credit card
  } catch (error) {
    showAlert('error', error);
  }
};
