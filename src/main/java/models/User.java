package models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Objects;

/**
 * Created by keegan on 4/18/15.
 */
public class User {

    private int id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String password;

    @JsonCreator
    public User(@JsonProperty("id") int id,
                @JsonProperty("name") String name,
                @JsonProperty("username") String username,
                @JsonProperty("email") String email,
                @JsonProperty("phone") String phone,
                @JsonProperty("password") String password) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.password = password;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .add("name", name)
                .add("username", username)
                .add("password", password)
                .add("email", email)
                .add("phone", phone)
                .toString();
    }
}
