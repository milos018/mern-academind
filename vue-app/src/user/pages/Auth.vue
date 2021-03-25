<template>
  <the-error-modal
    v-if="errorMessage"
    :errorMessage="errorMessage"
    @click="clearError"
  ></the-error-modal>
  <the-card class="authentication">
    <the-loading-spinner v-if="isLoading" :asOverlay="true">
    </the-loading-spinner>
    <h2>Login Required</h2>
    <hr />
    <form @submit.prevent="authSubmitHandler">
      <the-input
        v-if="!isLoginMode"
        id="name"
        element="input"
        type="text"
        label="Your name"
        :validators="[validatorRequired()]"
        errorText="Please enter name."
        @onInput="inputHandler"
      ></the-input>
      <the-input
        id="email"
        element="input"
        type="email"
        label="Email"
        :validators="[validatorEmail()]"
        errorText="Please enter valid email."
        @onInput="inputHandler"
      ></the-input>
      <the-input
        hello="something"
        id="password"
        element="input"
        type="password"
        label="Password"
        :validators="[validatorMinlegth(6)]"
        errorText="Please enter valid password, min legth 6 characters."
        @onInput="inputHandler"
      ></the-input>
      <the-button type="submit" :disabled="!formData.isValid">{{
        isLoginMode ? "Login" : "Signup"
      }}</the-button>
      <the-button type="button" inverse="inverse" @click="switchModeHandler"
        >Switch to {{ isLoginMode ? "Signup" : "Login" }}</the-button
      >
    </form>
  </the-card>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttp } from "../../shared/hooks/http-hook";

import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from "../../shared/utils/validator";

export default {
  setup() {
    const isLoginMode = ref(true);

    const { isLoading, errorMessage, sendRequest, clearError } = useHttp();

    const [formData, inputHandler, setFormData] = useForm(
      {
        email: {
          value: "",
          isValid: false
        },
        password: {
          value: "",
          isValid: false
        }
      },
      false
    );

    const switchModeHandler = () => {
      if (!isLoginMode.value) {
        setFormData(
          {
            ...formData.inputs,
            name: undefined
          },
          formData.inputs.email.isValid && formData.inputs.password.isValid
        );
      } else {
        setFormData(
          {
            ...formData.inputs,
            name: "",
            isValid: false
          },
          false
        );
      }
      isLoginMode.value = !isLoginMode.value;
    };

    const store = useStore();
    const router = useRouter();

    const authSubmitHandler = async () => {
      if (isLoginMode.value) {
        try {
          const url = "http://localhost:5500/api/users/login";

          await sendRequest(
            url,
            "POST",
            JSON.stringify({
              email: formData.inputs.email.value,
              password: formData.inputs.password.value
            }),
            { "Content-Type": "application/json" }
          );

          store.dispatch("login");
          router.push("/");
        } catch (error) {
          console.log(error.message);
        }
      } else {
        try {
          const url = "http://localhost:5500/api/users/signup";

          await sendRequest(
            url,
            "POST",
            JSON.stringify({
              name: formData.inputs.name.value,
              email: formData.inputs.email.value,
              password: formData.inputs.password.value
            }),
            { "Content-Type": "application/json" }
          );

          store.dispatch("login");
          router.push("/");
        } catch (error) {
          console.log(error.message);
        }
      }
    };

    const validatorEmail = () => VALIDATOR_EMAIL();
    const validatorMinlegth = val => VALIDATOR_MINLENGTH(val);
    const validatorRequired = () => VALIDATOR_REQUIRE();

    return {
      isLoading,
      errorMessage,
      isLoginMode,
      formData,
      switchModeHandler,
      authSubmitHandler,
      inputHandler,
      clearError,
      validatorEmail,
      validatorMinlegth,
      validatorRequired
    };
  }
};
</script>

<style>
.authentication__header {
  color: white;
  text-align: center;
}

.authentication {
  width: 90%;
  max-width: 25rem;
  margin: 7rem auto;
  text-align: center;
}

.authentication form {
  margin-bottom: 1rem;
}
</style>