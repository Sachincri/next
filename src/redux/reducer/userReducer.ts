import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState, User } from "@/types";
import { userApi } from "../api/userApi";

const initialState: UserState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  otpSent: false,
  error: null,
  message: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    otpSentSuccess: (state) => {
      state.loading = false;
      state.otpSent = true;
    },
    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    registerFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    verifyOtpRequest: (state) => {
      state.loading = true;
    },
    verifyOtpSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    verifyOtpFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addMatcher(userApi.endpoints.login.matchPending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher(userApi.endpoints.login.matchFulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data?.user || null;
    });
    builder.addMatcher(userApi.endpoints.login.matchRejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.data?.message || "Login failed";
      state.user = null;
    });

    // Load User
    builder.addMatcher(userApi.endpoints.loadUser.matchPending, (state) => {
      state.loading = true;
    });
    builder.addMatcher(userApi.endpoints.loadUser.matchFulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = !!action.payload;
      state.user = action.payload || null;
    });
    builder.addMatcher(userApi.endpoints.loadUser.matchRejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    });

    // OTP Sending (Login)
    builder.addMatcher(userApi.endpoints.sendLoginOtp.matchPending, (state) => {
      // state.loading = true; // Don't trigger global loading for OTP
      state.error = null;
    });
    builder.addMatcher(userApi.endpoints.sendLoginOtp.matchFulfilled, (state) => {
      state.loading = false;
      state.otpSent = true;
    });
    builder.addMatcher(userApi.endpoints.sendLoginOtp.matchRejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.data?.message || "Failed to send OTP";
    });

    // OTP Verification (Login)
    builder.addMatcher(userApi.endpoints.verifyLoginOtp.matchPending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher(userApi.endpoints.verifyLoginOtp.matchFulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data?.user || null;
      state.otpSent = false;
    });
    builder.addMatcher(userApi.endpoints.verifyLoginOtp.matchRejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.data?.message || "OTP Verification failed";
      state.user = null;
    });

    // OTP Verification (Register)
    builder.addMatcher(userApi.endpoints.verifyEmailOtp.matchPending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher(userApi.endpoints.verifyEmailOtp.matchFulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data?.user || null;
      state.otpSent = false;
    });
    builder.addMatcher(userApi.endpoints.verifyEmailOtp.matchRejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.data?.message || "Email Verification failed";
    });

    // Register
    builder.addMatcher(userApi.endpoints.register.matchPending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher(userApi.endpoints.register.matchFulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      // state.otpSent = true; // Optional: if we want to standardize OTP handling
    });
    builder.addMatcher(userApi.endpoints.register.matchRejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.data?.message || "Registration failed";
    });

    // Update Profile
    builder.addMatcher(userApi.endpoints.updateProfile.matchPending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher(userApi.endpoints.updateProfile.matchFulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.data?.user || null;
    });
    builder.addMatcher(userApi.endpoints.updateProfile.matchRejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as any)?.data?.message || "Profile update failed";
    });

    // Logout
    builder.addMatcher(userApi.endpoints.logout.matchFulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.otpSent = false;
    });
  }
});

export const {
  otpSentSuccess,
  registerRequest,
  registerSuccess,
  registerFail,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFail,
  clearError,
  clearMessage,
  resetOtpState,
} = userSlice.actions;

export const userData = userSlice.reducer;
