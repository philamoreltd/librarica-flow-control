import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Play, 
  BookOpen, 
  FlaskConical, 
  Atom, 
  Calculator,
  FileText,
  ClipboardList,
  GraduationCap,
  Video,
  Globe,
  BookMarked,
  Briefcase,
  Monitor,
  Home,
  Palette,
  Music,
  Cross
} from "lucide-react";

interface ResourceLink {
  title: string;
  url: string;
}

interface FormContent {
  form: string;
  resources: ResourceLink[];
}

interface SubjectData {
  name: string;
  icon: React.ReactNode;
  color: string;
  forms: FormContent[];
}

// Videos Data
const videosData: SubjectData[] = [
  {
    name: "Mathematics",
    icon: <Calculator className="h-5 w-5" />,
    color: "bg-blue-500",
    forms: [
      {
        form: "Form One",
        resources: [
          { title: "Natural Numbers", url: "https://drive.google.com/file/d/1CunbXX7ZoOzq-OkGxCZxMJ7UdzoBYoX2/view?usp=drive_link" },
          { title: "Factors & Multiples", url: "https://drive.google.com/file/d/1Q5d94TexuBE44xVSaGaYJZcj0qjWGZiZ/view?usp=drive_link" },
          { title: "Integers", url: "https://drive.google.com/file/d/1-7QY9CXN6r79m2yvzCi6beCkHZMhJw_2/view?usp=drive_link" },
          { title: "Fractions", url: "https://drive.google.com/file/d/1e8FRuJuhA88wlLG6gGgwqUm2SWJcsIhS/view?usp=drive_link" },
          { title: "Decimals", url: "https://drive.google.com/file/d/1oD4H6ZBWDO9epbKZW9xqXApHEsdhyJ_o/view?usp=drive_link" },
          { title: "Squares & Square Roots", url: "https://drive.google.com/file/d/1Sj5AmsI0_H7BAlZgqpF1_RjHvyJ_W8gL/view?usp=drive_link" },
          { title: "Angles", url: "https://drive.google.com/file/d/16EnYaidHad_xAoB-dnzNEqFYmFyJOGBL/view?usp=drive_link" },
          { title: "Polygons", url: "https://drive.google.com/file/d/1zKJFBRLNgCxX80JYtymivAU3Rw4Xh0ps/view?usp=drive_link" },
          { title: "Length", url: "https://drive.google.com/file/d/12rxAvwRdANoC5WjQ9AcCHR6SDxJBtXJ6/view?usp=drive_link" },
          { title: "Geometric Constructions", url: "https://drive.google.com/file/d/1dYm5BtNYHoiQXxTEqmbMM3elRuXFR-TY/view?usp=drive_link" },
          { title: "Algebraic Expressions", url: "https://drive.google.com/file/d/19o2EUki7Xt5yJZ2DNiXPsDhAiEJauyVo/view?usp=drive_link" },
          { title: "Linear Equations", url: "https://drive.google.com/file/d/1SYiB3bYA0Kr-qYvcjxVseygcEntB4nZ7/view?usp=drive_link" },
          { title: "Coordinates & Graphs", url: "https://drive.google.com/file/d/10SMZH-EnWfYFuLKE2Y2bofnHQ_xWruTG/view?usp=drive_link" },
          { title: "Volume & Capacity", url: "https://drive.google.com/file/d/1NqIeaUAqDjF-4UEic7ZwasCUY3K23cCd/view?usp=drive_link" },
          { title: "Mass, Weight & Density", url: "https://drive.google.com/file/d/1s1zh1yudoT35nSDkHlka5A6UVroKFmM1/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        resources: [
          { title: "Cubes & Cube Roots", url: "https://drive.google.com/file/d/1cOHFZwydEWmc3OKKlmVIeyO8MOZOSLEv/view?usp=drive_link" },
          { title: "Reciprocals", url: "https://drive.google.com/file/d/1M1mBBoOFpXFTmvqZetNHG2-HRp31g3fj/view?usp=drive_link" },
          { title: "Indices", url: "https://drive.google.com/file/d/1YROPYw-nkPQIBAAhj_D--86nnLxP6FA6/view?usp=drive_link" },
          { title: "Common Logarithms", url: "https://drive.google.com/file/d/1ey4y_4g0f9t8LZrFKL4REMkyUmy6jGtS/view?usp=drive_link" },
          { title: "Equations of Straight Line", url: "https://drive.google.com/file/d/17o22I7XlhDjpge2FW3b4renEmgrmpgMm/view?usp=drive_link" },
          { title: "The Pythagoras Theorem", url: "https://drive.google.com/file/d/1M5jlUQxFomUqNWGcGej2aVvfzGA2Mqby/view?usp=drive_link" },
          { title: "Trigonometric Ratios", url: "https://drive.google.com/file/d/15OecR2vJtJpcWeO1ihIJB9xhFxW6UrgJ/view?usp=drive_link" },
          { title: "Quadratic Expressions", url: "https://drive.google.com/file/d/1gr2uJGvQLjPojGchsw8FKNFaWt1vKnsS/view?usp=drive_link" },
          { title: "Linear Motion", url: "https://drive.google.com/file/d/1eNlNQbIXc2GG0fwXGur_ovUOc-CDMmYy/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Three",
        resources: [
          { title: "Quadratic Expressions & Equations", url: "https://drive.google.com/file/d/1Xsg2r4HqvdB31jTzjVG55cVrHW-RbuC7/view?usp=drive_link" },
          { title: "Approximation & Errors", url: "https://drive.google.com/file/d/19za6IYAJ9cprzMhrJv2k_V18-miO60MY/view?usp=drive_link" },
          { title: "Trigonometric Ratios", url: "https://drive.google.com/file/d/1ffvyMwIHPBQMCy7MhJSpnxBxeHxuuZGY/view?usp=drive_link" },
          { title: "Surds", url: "https://drive.google.com/file/d/1lVsmB4kzmfjQMSeyAmOSyjh07G9qaXME/view?usp=drive_link" },
          { title: "Logarithms", url: "https://drive.google.com/file/d/11cqtpo34H3whKTuxlqpH-CAhpaEJUDeL/view?usp=drive_link" },
          { title: "Matrices", url: "https://drive.google.com/file/d/1hVWnCKxHy1UU7isUSjuUVw9tBupVu97b/view?usp=drive_link" },
          { title: "Probability", url: "https://drive.google.com/file/d/1U9oML_gkGqIyhH_e6RF5b7cGxDJ0h_9p/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        resources: [
          { title: "Matrices & Transformation", url: "https://drive.google.com/file/d/1WPu2BUI6JUh7yXO9kKtcBPy-wUe78PqQ/view?usp=drive_link" },
          { title: "Statistics", url: "https://drive.google.com/file/d/1KQFMCg0ylfuaHV9OyThUspXdLAwqsZyQ/view?usp=drive_link" },
          { title: "Locus", url: "https://drive.google.com/file/d/1fKlfjif9vyFJz6Ook32CGDbre4WgsCOa/view?usp=drive_link" },
          { title: "Linear Programming", url: "https://drive.google.com/file/d/1owRWi7bR6TUIF_p-CTfiYiR9OoOGBMOV/view?usp=drive_link" },
          { title: "Differentiation", url: "https://drive.google.com/file/d/1GWTqXwXw5Nx_J3SedxV1NfoW1u0fZ8tG/view?usp=drive_link" },
          { title: "Integration", url: "https://drive.google.com/file/d/1HNhwlUfn5OcVBCyfEn6b_vntEOBmWDH3/view?usp=drive_link" },
        ],
      },
    ],
  },
  {
    name: "Chemistry",
    icon: <FlaskConical className="h-5 w-5" />,
    color: "bg-green-500",
    forms: [
      {
        form: "Form One",
        resources: [
          { title: "Introduction to Chemistry", url: "https://drive.google.com/file/d/1lIE_tU12NgCNetKKNsok666kl4dfvwHv/view?usp=drive_link" },
          { title: "Simple Classification of Substance", url: "https://drive.google.com/file/d/1__NiJoColLbdzWyHDGbXxg9Q17lF9vbG/view?usp=drive_link" },
          { title: "Acids, Bases & Indicators", url: "https://drive.google.com/file/d/1U-7zaaLa2oodfbmp0eHnEtG4qQXC5gRj/view?usp=drive_link" },
          { title: "Air & Combustion", url: "https://drive.google.com/file/d/1VIkwunwMiApixJYtDH__UbIVQ8bD_khT/view?usp=drive_link" },
          { title: "Water & Hydrogen", url: "https://drive.google.com/file/d/1oJzvpIBUEQ8neOcNUiYBG3vE4oSp-7u2/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        resources: [
          { title: "Atomic Structure & Periodic Table", url: "https://drive.google.com/file/d/1TmH8J7kjAFZj3YZC8IGCNX-GeEUgrsiH/view?usp=drive_link" },
          { title: "Chemical Families", url: "https://drive.google.com/file/d/1lKnMQV0njZ7qmJOWxKd7iUkJhkWMI8-H/view?usp=drive_link" },
          { title: "Structure & Bonding", url: "https://drive.google.com/file/d/1G5YaLOGAtew-N5AsZxFzO3mpxzLS0pON/view?usp=drive_link" },
          { title: "Salts", url: "https://drive.google.com/file/d/1gymzZS1O7ZIAkzEetWN89lucnrBqG_8b/view?usp=drive_link" },
          { title: "Carbon & Its Compounds", url: "https://drive.google.com/file/d/1uEQaewKXS2qmzWpPmTvMdhC5hjaLWTyK/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Three",
        resources: [
          { title: "Gas Laws", url: "https://drive.google.com/file/d/1GsNjRwMjRR6KdMGkt8hWTEZqN--V4i-5/view?usp=drive_link" },
          { title: "The Mole", url: "https://drive.google.com/file/d/1zGPtetoYx-wTE2qT21xk-11ZQfA-BYI5/view?usp=drive_link" },
          { title: "Volumetric Analysis", url: "https://drive.google.com/file/d/1koCWq2d6PPuEAOLaDMFBV0-YbqmVFl2G/view?usp=drive_link" },
          { title: "Nitrogen & Its Compound", url: "https://drive.google.com/file/d/1_bMU6kw0QjgdxyHaObn04MDYffthEUG5/view?usp=drive_link" },
          { title: "Chlorine & Its Compound", url: "https://drive.google.com/file/d/1Q_JzZUQkX2uw9BU-nhnw0CK8Kiz7b-qC/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        resources: [
          { title: "Organic Chemistry II", url: "#" },
          { title: "Acid, Bases & Salts", url: "#" },
          { title: "Radioactivity", url: "#" },
        ],
      },
    ],
  },
  {
    name: "Biology",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-emerald-500",
    forms: [
      {
        form: "Form One",
        resources: [
          { title: "Introduction to Biology", url: "https://drive.google.com/file/d/1lIE_tU12NgCNetKKNsok666kl4dfvwHv/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        resources: [
          { title: "Transport in Plants and Animals", url: "#" },
          { title: "Respiration", url: "#" },
          { title: "Gaseous Exchange", url: "#" },
        ],
      },
      {
        form: "Form Three",
        resources: [
          { title: "Classification of Living Things (I)", url: "https://drive.google.com/file/d/1EYrXsZeHeq1mTXnxp0EL7Fk0Es0Os2e_/view?usp=drive_link" },
          { title: "Classification of Living Things (II)", url: "https://drive.google.com/file/d/1deblKcy30SgaBoLsQmw1UbwI9d6DhqrR/view?usp=drive_link" },
          { title: "Ecology", url: "https://drive.google.com/file/d/1dQLgj5OaJ3GEa2ZJs1qVoDk6vydFJA0c/view?usp=drive_link" },
          { title: "The Cell Division", url: "https://drive.google.com/file/d/1gF7E6rtjLo-iTqkBFKlb_f2RTsCT3V5J/view?usp=drive_link" },
          { title: "Reproduction", url: "https://drive.google.com/file/d/1vHB1gd8sbbY_MY_1m9WxcsCclLW222DY/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        resources: [
          { title: "Genetics (Variation)", url: "https://drive.google.com/file/d/1j5lcISdf8RoRoB_O-sKTd5IYlu-LPyAG/view?usp=drive_link" },
          { title: "Genetics (Heredity)", url: "https://drive.google.com/file/d/1JnyLh4A6p6dp-3nXzc2rVKzKGvGXcy1x/view?usp=drive_link" },
          { title: "Evolution", url: "https://drive.google.com/file/d/1UyMcVJNPGY6toYVQ9pT8TWrhL37M0rur/view?usp=drive_link" },
          { title: "Support & Movement", url: "https://drive.google.com/file/d/1lEh-tNGnX38DR9OPAqAug30OpUOsApD4/view?usp=drive_link" },
        ],
      },
    ],
  },
  {
    name: "Physics",
    icon: <Atom className="h-5 w-5" />,
    color: "bg-purple-500",
    forms: [
      {
        form: "Form One",
        resources: [
          { title: "Introduction to Physics", url: "https://drive.google.com/file/d/1QjjMnsqGApC6MCObDaK95R7_9F80Bh2E/view?usp=drive_link" },
          { title: "Measurement", url: "https://drive.google.com/file/d/150ZxwPxtmKaJTDyLXSMjYLIS24C7J1Qr/view?usp=drive_link" },
          { title: "Force", url: "https://drive.google.com/file/d/17868Tedr0C_sr-6SWF0dhHtN9mNeug3k/view?usp=drive_link" },
          { title: "Pressure", url: "https://drive.google.com/file/d/1LtD1hnxG6XSIiLzuEYqLZQCTBVgExtUy/view?usp=drive_link" },
          { title: "Heat Transfer", url: "https://drive.google.com/file/d/1cO6Xktli94zFO-JK6YxeRq2Rtv8R6Oya/view?usp=drive_link" },
          { title: "Electrostatics I", url: "https://drive.google.com/file/d/1SxEZFb1T3RYE-Cko-BGvY9WFB1PcusV7/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Two",
        resources: [
          { title: "Magnetism", url: "https://drive.google.com/file/d/1BKCYZQuMzOUqvgZhq4_SJReHdxl_35jP/view?usp=drive_link" },
          { title: "Turning Effect of a Force", url: "https://drive.google.com/file/d/1DEc_P7u8KQMNW2pUWmMNx1l3lQAUZQ01/view?usp=drive_link" },
          { title: "Hookes Law", url: "https://drive.google.com/file/d/1r2HEn61nw4Q5v8alM4MgYYbGiTGz7nFv/view?usp=drive_link" },
          { title: "Waves", url: "https://drive.google.com/file/d/1fpRVrHO4aqQVzCeb_bF43_G6aCBvTlHF/view?usp=drive_link" },
          { title: "Sound", url: "https://drive.google.com/file/d/1HLLLJRsZfGLFQEjwTN4x0l7X94FKrHRy/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Three",
        resources: [
          { title: "Linear Motion", url: "https://drive.google.com/file/d/1vvv9DsglvfZsnNDu63iQ9gyomY_1B-dp/view?usp=drive_link" },
          { title: "Newtons Laws of Motion", url: "https://drive.google.com/file/d/1B3wnYaesgr12PLzSmBelobpIB-Fl7g1Y/view?usp=drive_link" },
          { title: "Work, Energy, Power & Machines", url: "https://drive.google.com/file/d/1dCAqKvkpBJeMEv-XnSGX7qSF8r8dgtuQ/view?usp=drive_link" },
          { title: "Current Electricity", url: "https://drive.google.com/file/d/1th5LXnxEevUK2CJMD5s7B6eDWe0c3myt/view?usp=drive_link" },
          { title: "Gas Laws", url: "https://drive.google.com/file/d/1byJNsT-e_k2SYg_1M8V5hivb8ykHmxom/view?usp=drive_link" },
        ],
      },
      {
        form: "Form Four",
        resources: [
          { title: "Thin Lenses", url: "https://drive.google.com/file/d/1mM6uLiSHE-NxNg8GQJif2eHtMp62Rv7D/view?usp=drive_link" },
          { title: "Electromagnetic Spectrum", url: "https://drive.google.com/file/d/1W2P_h5HwCUJqXh3dq3sU1s1jCpJwvDEE/view?usp=drive_link" },
          { title: "Electromagnetic Induction", url: "https://drive.google.com/file/d/1wiKzjINnuazH7HufQ1RCI6Nr1hiB8-ex/view?usp=drive_link" },
          { title: "X-Rays", url: "https://drive.google.com/file/d/1uuzWLQfIGN70iD7oZ6HluA1fbM6g976P/view?usp=drive_link" },
          { title: "Radioactivity", url: "https://drive.google.com/file/d/1yoyq1LdEnU9cn_HckoVaAWqsc9fUsOck/view?usp=drive_link" },
          { title: "Electronics", url: "https://drive.google.com/file/d/16JJtTLoW2vn8wUvRb5rTW-ijdX781gEr/view?usp=drive_link" },
        ],
      },
    ],
  },
];

// Summary Notes Data
const summaryNotesData: SubjectData[] = [
  {
    name: "Mathematics",
    icon: <Calculator className="h-5 w-5" />,
    color: "bg-blue-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1FpVWfecDNam4b6F_J_5LiU38GyNOC3_B/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1YiHGMRwHEFi6uAZUNe5WpTaQRBYNh2oo/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1cxogWBdrJBfGEiOvCgcmJag_JcMNNu4R/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1ToBUh-2a5C2Nown6ywRslLs4nk8hq-jx/view" }] },
    ],
  },
  {
    name: "Chemistry",
    icon: <FlaskConical className="h-5 w-5" />,
    color: "bg-green-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1XRE2-c7BT5wl83Zc2AH9IuWf49rsHoja/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1JR2_8LlUoRn1dsF07GXnTaTrSAzk7NY9/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1pQTEX2Z-ZDBUpnS1RxhECzUrVZpm4U4v/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1qYsneZ7Hysed20Muz3gRssIpS2mJasM4/view" }] },
      { form: "Practical Guide", resources: [{ title: "Chemistry Practical Guide", url: "https://drive.google.com/file/d/12hyMD8UiDUjbwSYFb7sYJnWSoswE4WGo/view" }] },
    ],
  },
  {
    name: "Biology",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-emerald-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1TXLQEgRK_KoYAmk-BUojcFxvs_a3tdAr/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1qCPYo7v_LYIxFIrFsjeElqzNvgio7Umm/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1pzrzWpoHISOBluC3e-r0-JRcBArI8isF/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/10sKQ5B-9IPmdA4DfKEMr9t4KUX2pi8wL/view" }] },
      { form: "Essays", resources: [{ title: "Essays & Expected Responses", url: "https://drive.google.com/file/d/1deNof72UAAjIk6fh49D0chGJWlZ-3IAf/view" }] },
    ],
  },
  {
    name: "Physics",
    icon: <Atom className="h-5 w-5" />,
    color: "bg-purple-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1_JknCKoVudh65vlruFmvgzWwQTG6I_MG/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1urzsCdvDLSIbQo_CCiKYrIwTBbF7Den5/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/10u7FAY5Fu1RPhu0GMSbK7kxuhxUIrVrP/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1J4xg-B1325F5GxIayEw61oAYQmGthR32/view" }] },
    ],
  },
  {
    name: "English",
    icon: <BookMarked className="h-5 w-5" />,
    color: "bg-red-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1lvvtEpjIBIeXhFjmsZB47uCju6YZL-cR/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1w2o_oCTqmDU3UBiaIlHbBgGNZTrcFc5j/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1MQIN0f53Kra7XqZgxkPgcDGNeivcVrLV/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1jv9ag5qb87rjVCmyjgh070lBMdTvRS88/view" }] },
      { form: "Writing Guides", resources: [
        { title: "Functional Writing Notes", url: "https://drive.google.com/file/d/11cO16HoWq-Bumm4t2p1CRbwhz15pxdok/view" },
        { title: "Composition Writing Guide", url: "https://drive.google.com/file/d/1aIT9A8kZAxDuK6Wsnni1QWgg6upkfElr/view" },
        { title: "Oral Literature Notes", url: "https://drive.google.com/file/d/1hC9IOxuIVD4_c0xwb-0ZQu_feNlS5CFB/view" },
      ]},
    ],
  },
  {
    name: "Kiswahili",
    icon: <Globe className="h-5 w-5" />,
    color: "bg-orange-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1VU567B62NaoxZO5vGSOFCC8qE3eUFiCk/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1rlwjKaQ0pSev48RNdCylU4mpX1xTx6qU/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/10RAsCbkKn0SBohE6pxMXpXRCldnWaJuz/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1FDHpzQbnEFFwhQP0g1LP5NuNEd9Deob3/view" }] },
    ],
  },
  {
    name: "Geography",
    icon: <Globe className="h-5 w-5" />,
    color: "bg-teal-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1Mwdnf-CQUEUFe-3oaTs7g16rQEDb9ntF/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1-9_9w56LlFEDx39Gh4BH0VUr41epTvCj/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1qJ7_Xmm5srUnrtknkjIgL_LwR6CAb8Wl/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1gLXKamW5kL1hP8Wm4U-z_GF3XB6FD4iE/view" }] },
    ],
  },
  {
    name: "History",
    icon: <BookMarked className="h-5 w-5" />,
    color: "bg-amber-600",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/13PL8hW0BNZ9_kBEzcjY3XlFUbrQguY93/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/11W-TqH5jCBqgA8t-BdsBmaCkz_ZBZiSY/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1vD66OhWHBC42W0CisCu5vjsCoLmRxwvb/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1Q_A2zjBhlsekMLXjPNSNm1tE0ZJEwP2Y/view" }] },
    ],
  },
  {
    name: "CRE",
    icon: <Cross className="h-5 w-5" />,
    color: "bg-indigo-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1uNuBR6CzVhpDoFc_Sm3YPUwwy-nH6Gc4/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/1zw-MOazJJNt_N_CoLAJZaEg3kXAcGLi5/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1d5pKm70qGjTrkbo7fnCrrULd_JwGDAW8/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1tDcTcEY4YdQRIhuqM4MBTvvYLJCeudBh/view" }] },
    ],
  },
  {
    name: "Computer Studies",
    icon: <Monitor className="h-5 w-5" />,
    color: "bg-cyan-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One PPT", url: "https://drive.google.com/file/d/1pA57H7BCTCXOe5F_w1Sun2y5-2FNQCR6/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two PPT", url: "https://drive.google.com/file/d/1uC17l_Wc938J78H9io0dNUdMQvc7kbh7/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three PPT", url: "https://drive.google.com/file/d/1szoUVl_0ppQo3Yb21xB28TgP9BzAiw_N/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four PPT", url: "https://drive.google.com/file/d/18e0GpvvzhKZ0_SXGxf9iKv380yWXNw7m/view" }] },
    ],
  },
  {
    name: "Home Science",
    icon: <Home className="h-5 w-5" />,
    color: "bg-pink-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Notes", url: "https://drive.google.com/file/d/1WN98RTUydOe1UGPwVzTAcDBSAtWly857/view" }] },
      { form: "Form Two", resources: [{ title: "Form Two Notes", url: "https://drive.google.com/file/d/17f0qdEgLXHR2yMHtiZi05w5GpqCIJt21/view" }] },
      { form: "Form Three", resources: [{ title: "Form Three Notes", url: "https://drive.google.com/file/d/1gWWirLCSVfSrTtrItGxQ2pe1zmAiN7um/view" }] },
      { form: "Form Four", resources: [{ title: "Form Four Notes", url: "https://drive.google.com/file/d/1gB-6DM58esKnJr4sLAxjgDbJcy4UCSU0/view" }] },
    ],
  },
];

// Topical Tests Data
const topicalTestsData: SubjectData[] = [
  {
    name: "Mathematics",
    icon: <Calculator className="h-5 w-5" />,
    color: "bg-blue-500",
    forms: [
      {
        form: "Form One",
        resources: [
          { title: "Numbers (Questions)", url: "https://drive.google.com/file/d/1l_xAJykFPzEeflhGX-8uM3N_KbQ-pGWy/view" },
          { title: "Numbers (Marking Scheme)", url: "https://drive.google.com/file/d/1JQVtfs9PS_5ALJ8xzZH0S9D9TFSjWS5O/view" },
          { title: "Integers (Q)", url: "https://drive.google.com/file/d/1dXqdTWrzrbTCU_REZRxAS__yly8rO965/view" },
          { title: "Integers (A)", url: "https://drive.google.com/file/d/1Ds_zzT83k6oUEZmU7DKMRfN6o7OAM7s1/view" },
          { title: "Fractions (Q)", url: "https://drive.google.com/file/d/1eACXDfOHSunc8ZNgU7q5WIt7QELn9mpr/view" },
          { title: "Fractions (A)", url: "https://drive.google.com/file/d/1gadp5BO7HlKzs-pCVVNNi0teBvSz0RNU/view" },
          { title: "Decimals (Q)", url: "https://drive.google.com/file/d/1L_S56t9hjYNWmMWRs7zhhrl1EwKUZLEO/view" },
          { title: "Decimals (A)", url: "https://drive.google.com/file/d/12WKrkLtzvZwK_FNSTRdDnHOTN7hbdvE0/view" },
          { title: "Algebraic Expressions (Q)", url: "https://drive.google.com/file/d/1HBvQIFxPNKSbB30OGwhu3pPIncN8-Ker/view" },
          { title: "Algebraic Expressions (A)", url: "https://drive.google.com/file/d/1OqNxxHlsaimnrnb5hL50k9CDmMUv2Ceo/view" },
        ],
      },
      {
        form: "Form Two",
        resources: [
          { title: "Logarithmic Equations", url: "https://drive.google.com/file/d/1Il5K63N1RR0sc3DiLMAXkqusmzKzQzGk/view" },
          { title: "Trigonometry (Q)", url: "https://drive.google.com/file/d/1AbnmzZXoRiKLfT3QckplKSlNPDAnqh98/view" },
          { title: "Trigonometry (A)", url: "https://drive.google.com/file/d/1UaBP5cilr0xU6-8A7m1nRa_8YtgUYrDV/view" },
          { title: "Quadratic Equations (Q)", url: "https://drive.google.com/file/d/14iWW8Q1qOlt1Xv7U8KfhmsHYLti96ds7/view" },
          { title: "Quadratic Equations (A)", url: "https://drive.google.com/file/d/1sd_QxpabHKZg_lEh21mKFtEfaEks8iuu/view" },
          { title: "Vectors (Q)", url: "https://drive.google.com/file/d/1kHyGNAIRQNJ6e035ePL4PsvhAZwhPW3r/view" },
          { title: "Vectors (A)", url: "https://drive.google.com/file/d/1k9r1gJw9BRr7Y2FO5yT1usPqsIe1vEev/view" },
        ],
      },
      {
        form: "Form Three",
        resources: [
          { title: "Quadratic Equations (Q)", url: "https://drive.google.com/file/d/1Whtas48vMZUoeini9IDS7E6BpJOdnNwa/view" },
          { title: "Quadratic Equations (A)", url: "https://drive.google.com/file/d/1hUrEti5t-IK84vPlnM_XtK8B4x6NM7pE/view" },
          { title: "Surds (Q)", url: "https://drive.google.com/file/d/10ocoymZMADHaq9RUDcdwhlSv-E4jkglZ/view" },
          { title: "Surds (A)", url: "https://drive.google.com/file/d/15k6zNQD7H0iBUJ2TYosifUGKBySkJTlC/view" },
          { title: "Matrices (Q)", url: "https://drive.google.com/file/d/1_s2SMCVah3AaGnYVXziE5o64pJ65zVI_/view" },
          { title: "Matrices (A)", url: "https://drive.google.com/file/d/1hSDm5bLBsTz7ClsAfzOE7maIKa_Vr8l0/view" },
          { title: "Probability (Q)", url: "https://drive.google.com/file/d/1v5Xgti8is8x-BSPteTZnl_tyYkbBn9y_/view" },
          { title: "Probability (A)", url: "https://drive.google.com/file/d/1zfcTtV8cSx6G95QMvgeIjoij38PbnU8b/view" },
        ],
      },
      {
        form: "Form Four",
        resources: [
          { title: "Matrices & Transformations (Q)", url: "https://drive.google.com/file/d/1SsZ5b8UbsqKQGQVnvyjrICyfuIRRINQ6/view" },
          { title: "Matrices & Transformations (A)", url: "https://drive.google.com/file/d/1OWmxg0BwFahKZb4Vk6sCtXjeGxeQxktk/view" },
          { title: "Statistics (Q)", url: "https://drive.google.com/file/d/1q_ezQn0glDA3PMjJzyk_tDn6EHUqG2C6/view" },
          { title: "Statistics (A)", url: "https://drive.google.com/file/d/1kQsb_Gd7WBtuGSOLgoSXScmvAqrhBYsE/view" },
          { title: "Integration (Q)", url: "https://drive.google.com/file/d/1XDPuHsoa8p7F4k_qs3Q-K--Q1tmZ_D1y/view" },
          { title: "Integration (A)", url: "https://drive.google.com/file/d/1e-tzyzlzGrszT3lFkpkrkRXsb5NLomSl/view" },
        ],
      },
    ],
  },
  {
    name: "Chemistry",
    icon: <FlaskConical className="h-5 w-5" />,
    color: "bg-green-500",
    forms: [
      {
        form: "Form One",
        resources: [
          { title: "Introduction to Chemistry (Q)", url: "https://drive.google.com/file/d/1a0cKb3W_kSVJEsI-KB4jx7DCOR8W9fRU/view" },
          { title: "Introduction to Chemistry (A)", url: "https://drive.google.com/file/d/1VCYbqw7HZn6ZNkXtvlBSddvWUlq4xRuQ/view" },
          { title: "Acid, Bases And Indicators (Q)", url: "https://drive.google.com/file/d/1q2Kx5j6_N3CoVU31eBG2ZjvDyjovDSDl/view" },
          { title: "Acid, Bases And Indicators (A)", url: "https://drive.google.com/file/d/1Im0kFFVq9k4wpMKW1y59PunIDjrZV2Z8/view" },
          { title: "Air and Combustion (Q)", url: "https://drive.google.com/file/d/1zlc3UyFkaMUPRJ8tosOtosdFieQ0WS2S/view" },
          { title: "Air and Combustion (A)", url: "https://drive.google.com/file/d/13EtY6wf3g_rHbIsSL_nhWgblUngo4jYU/view" },
        ],
      },
      {
        form: "Form Two",
        resources: [
          { title: "Atomic Structure (Q)", url: "https://drive.google.com/file/d/14_qRVEFDICRb-KmBuE2g2PmAfMWnBFvJ/view" },
          { title: "Atomic Structure (A)", url: "https://drive.google.com/file/d/1cTrEHaugj3CwBuowXJAmP9xdByrD6uiB/view" },
          { title: "Chemical Families (Q)", url: "https://drive.google.com/file/d/1OBf0OTIwFnD4GO6O1npaqUpLPNgB2Atd/view" },
          { title: "Chemical Families (A)", url: "https://drive.google.com/file/d/1A2d3lw0cqPM_3fDtMX0mPt0u3cR5RvUg/view" },
          { title: "Structure and Bonding (Q)", url: "https://drive.google.com/file/d/1JJ_b1YOHHA1ulyhLaLhyWgmj22FyiNDy/view" },
          { title: "Structure and Bonding (A)", url: "https://drive.google.com/file/d/1iHMHBnZX1cig2bayMg9shQXocrzVF88N/view" },
        ],
      },
      {
        form: "Form Three",
        resources: [
          { title: "Gas Laws (Q)", url: "https://drive.google.com/file/d/1SzqlvNmqr464zdKdTVkWyFwJoF0APK5o/view" },
          { title: "Gas Laws (A)", url: "https://drive.google.com/file/d/1kepwj-tcb2m4Gu22VY3jmRp1vw0bAu21/view" },
          { title: "The Mole (Q)", url: "https://drive.google.com/file/d/1gampTa89bn5GDFdChKTKZ9gUWKXINcg1/view" },
          { title: "The Mole (A)", url: "https://drive.google.com/file/d/1_vFqPq3a2BOFGQH5n2NlMuoSnNNZldx_/view" },
          { title: "Organic Chemistry (Q)", url: "https://drive.google.com/file/d/1fHqw4LD2gVnA_vI3ybekGYJJlB77LDnp/view" },
          { title: "Organic Chemistry (A)", url: "https://drive.google.com/file/d/1g8V9UO_oxUG4u5J7uBwJCgTB919XMncj/view" },
        ],
      },
      {
        form: "Form Four",
        resources: [
          { title: "Acids, Bases and Salts (Q)", url: "https://drive.google.com/file/d/1dy-RNqjVvCuWbEN-PCcApIlD7wjAS4T_/view" },
          { title: "Acids, Bases and Salts (A)", url: "https://drive.google.com/file/d/1WzYmMfOvdWbwbuaSVSzsHjJq5LJw0Oqi/view" },
          { title: "Electrochemistry (Q)", url: "https://drive.google.com/file/d/1EAzXNou72sajJWW2uRqRGecIQTPCQJve/view" },
          { title: "Electrochemistry (A)", url: "https://drive.google.com/file/d/1sTRq8Wi4j-FJ8Nn4iOrwmubQAKw4Dz9i/view" },
          { title: "Radioactivity (Q)", url: "https://drive.google.com/file/d/1HFfBp2TeHp8Io0aSQOZp7AqqF0JFfD5U/view" },
          { title: "Radioactivity (A)", url: "https://drive.google.com/file/d/19I3uWMrR3_pyeSOKUN3CEjDlH5dwUzpY/view" },
        ],
      },
    ],
  },
  {
    name: "Biology",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-emerald-500",
    forms: [
      { form: "Form One", resources: [{ title: "Form One Tests (Coming Soon)", url: "#" }] },
      { form: "Form Two", resources: [{ title: "Form Two Tests (Coming Soon)", url: "#" }] },
      { form: "Form Three", resources: [{ title: "Form Three Tests (Coming Soon)", url: "#" }] },
      { form: "Form Four", resources: [{ title: "Form Four Tests (Coming Soon)", url: "#" }] },
    ],
  },
  {
    name: "Physics",
    icon: <Atom className="h-5 w-5" />,
    color: "bg-purple-500",
    forms: [
  { form: "Form One", resources: [{ title: "Form One Tests (Coming Soon)", url: "#" }] },
      { form: "Form Two", resources: [{ title: "Form Two Tests (Coming Soon)", url: "#" }] },
      { form: "Form Three", resources: [{ title: "Form Three Tests (Coming Soon)", url: "#" }] },
      { form: "Form Four", resources: [{ title: "Form Four Tests (Coming Soon)", url: "#" }] },
    ],
  },
];

// KCSE Past Papers Data - Actual links from elimucentre.co.ke and teacher.co.ke
const kcsePastPapersData: SubjectData[] = [
  {
    name: "Mathematics",
    icon: <Calculator className="h-5 w-5" />,
    color: "bg-blue-500",
    forms: [
      {
        form: "2023",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-MATHEMATICS-PAPER-1-KCSE.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-MATHEMATICS-PAPER-1-KCSE-1.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-MATHEMATICS-PAPER-2-KCSE.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-MATHEMATICS-PAPER-2-KCSE-1.pdf" },
        ],
      },
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Mathematics-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Mathematics-Paper-2-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Mathematics-Paper-1.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Mathematics-Paper-1-Marking-Scheme-Teacher_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Mathematics-Paper-2.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Mathematics-Paper-2-Marking-Scheme-Teacher_ke.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/MATHEMATICS-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/MATHEMATICS-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/MATHEMATICS-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/MATHEMATICS-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Chemistry",
    icon: <FlaskConical className="h-5 w-5" />,
    color: "bg-green-500",
    forms: [
      {
        form: "2023",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-CHEMISTRY-PAPER-1-KCSE.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-CHEMISTRY-PAPER-1-KCSE-1.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-Chem-paper-KCSE-2-2023.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-Chem-paper-KCSE-2-2023-1.pdf" },
        ],
      },
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Chemistry-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Chemistry-Paper-2-Teacher_co_ke.pdf" },
          { title: "Paper 3 Practical", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Chemistry-Paper-3-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Chemistry-Paper-1.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Chemistry-Paper-1-Marking-Scheme-Teacher_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Chemistry-Paper-2.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Chemistry-Paper-2-Marking-Scheme-Teacher_ke.pdf" },
          { title: "Paper 3 Practical", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Chemistry-Paper-3.pdf" },
          { title: "Paper 3 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Chemistry-Paper-3-Marking-Scheme-Teacher_ke.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHEMISTRY-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHEMISTRY-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHEMISTRY-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHEMISTRY-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 3 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHEMISTRY-PAPER-3-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 3 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHEMISTRY-PAPER-3-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Biology",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-emerald-500",
    forms: [
      {
        form: "2023",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-BIOLOGY-PAPER-1-KCSE.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-BIOLOGY-PAPER-1-KCSE-1.pdf" },
        ],
      },
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Biology-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 3 Practical", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Biology-Paper-3-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Biology-Paper-1.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Biology-Paper-2.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Biology-Paper-2-Marking-Scheme-Teacher_ke.pdf" },
          { title: "Paper 3 Practical", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Biology-Paper-3.pdf" },
          { title: "Paper 3 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Biology-Paper-3-Marking-Scheme-Teacher_ke.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BIOLOGY-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BIOLOGY-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BIOLOGY-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BIOLOGY-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 3 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BIOLOGY-PAPER-3-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Physics",
    icon: <Atom className="h-5 w-5" />,
    color: "bg-purple-500",
    forms: [
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Physics-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Physics-Paper-2-Teacher_co_ke.pdf" },
          { title: "Paper 3 Practical", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Physics-Paper-3-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Physics-Paper-1.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Physics-Paper-1-Marking-Scheme-Teacher_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Physics-Paper-2.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Physics-Paper-2-Marking-Scheme-Teacher_ke.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/PHYSICS-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/PHYSICS-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/PHYSICS-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/PHYSICS-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 3 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/PHYSICS-PAPER-3-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 3 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/PHYSICS-PAPER-3-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "English",
    icon: <BookMarked className="h-5 w-5" />,
    color: "bg-red-500",
    forms: [
      {
        form: "2023",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-ENGLISH-PAPER-1.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-ENGLISH-PAPER-1-1.pdf" },
        ],
      },
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-English-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Language", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-English-language-Teacher_co_ke.pdf" },
          { title: "Paper 3 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-English-Paper-3-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-English-Paper-1.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-English-Paper-2.pdf" },
          { title: "Paper 3 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-English-Paper-3.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/ENGLISH-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/ENGLISH-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/ENGLISH-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/ENGLISH-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 3 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/ENGLISH-PAPER-3-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 3 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/ENGLISH-PAPER-3-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Kiswahili",
    icon: <Globe className="h-5 w-5" />,
    color: "bg-orange-500",
    forms: [
      {
        form: "2022",
        resources: [
          { title: "Karatasi 1 Maswali", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Kiswahili-Paper-1-Teacher_co_ke.pdf" },
          { title: "Karatasi 2 Lugha", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Kiswahili-Lugha-Paper-2-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Karatasi 1 Maswali", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Kiswahili-Paper-1.pdf" },
          { title: "Karatasi 2 Maswali", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Kiswahili-Karatasi-Ya-2.pdf" },
          { title: "Karatasi 2 Majibu", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Kiswahili-Paper-2-Mwongozo-wa-Kusahihisha-Teacher_ke.pdf" },
          { title: "Karatasi 3 Maswali", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Kiswahili-Karatasi-ya-3.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Karatasi 1 Maswali", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/KISWAHILI-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Karatasi 1 Majibu", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/KISWAHILI-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Karatasi 2 Maswali", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/KISWAHILI-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Karatasi 2 Majibu", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/KISWAHILI-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Karatasi 3 Maswali", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/KISWAHILI-PAPER-3-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Karatasi 3 Majibu", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/KISWAHILI-PAPER-3-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Geography",
    icon: <Globe className="h-5 w-5" />,
    color: "bg-teal-500",
    forms: [
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Geography-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Geography-Paper-2-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Geography-Paper-1.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Geography-Paper-2.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/GEOGRAPHY-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/GEOGRAPHY-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/GEOGRAPHY-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/GEOGRAPHY-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "History",
    icon: <BookMarked className="h-5 w-5" />,
    color: "bg-amber-600",
    forms: [
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-History-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-History-Paper-2-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-History-Paper-1.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-History-Paper-2.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/HISTORY-AND-GOVERNMENT-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/HISTORY-AND-GOVERNMENT-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/HISTORY-AND-GOVERNMENT-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/HISTORY-AND-GOVERNMENT-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "CRE",
    icon: <Cross className="h-5 w-5" />,
    color: "bg-indigo-500",
    forms: [
      {
        form: "2023",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-CRE-PAPER-1-.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-CRE-PAPER-1-1-1.pdf" },
        ],
      },
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-CRE-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-CRE-Paper-2-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Christian-Religious-Education-Paper-1.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Christian-Religious-Education-Paper-2.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHRISTIAN-RELIGIOUS-EDUCATION-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CRE-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CHRISTIAN-RELIGIOUS-EDUCATION-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/CRE-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Agriculture",
    icon: <Home className="h-5 w-5" />,
    color: "bg-lime-600",
    forms: [
      {
        form: "2023",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-AGRICULTURE-PAPER-1-KCSE.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2023/12/2023-AGRICULTURE-PAPER-1-KCSE-1.pdf" },
        ],
      },
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Agriculture-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Agriculture-Paper-2-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Agriculture-Paper-1.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Agriculture-Paper-2.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/AGRICULTURE-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/AGRICULTURE-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/AGRICULTURE-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/AGRICULTURE-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Business Studies",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-cyan-600",
    forms: [
      {
        form: "2022",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Business-Studies-Paper-1-Teacher_co_ke.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2023/03/2022-KCSE-Business-Studies-Paper-2-Teacher_co_ke.pdf" },
        ],
      },
      {
        form: "2021",
        resources: [
          { title: "Paper 1 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Business-Studies-Paper-1.pdf" },
          { title: "Paper 2 Questions", url: "https://teacher.co.ke/wp-content/uploads/bsk-pdf-manager/2022/04/KCSE-2021-Business-Studies-Paper-2.pdf" },
        ],
      },
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BUSINESS-STUDIES-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 1 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BUSINESS-STUDIES-PAPER-1-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
          { title: "Paper 2 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BUSINESS-STUDIES-PAPER-2-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
          { title: "Paper 2 Marking Scheme", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/BUSINESS-STUDIES-PAPER-2-KCSE-2020-MARKING-SCHEME-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
  {
    name: "Computer Studies",
    icon: <Monitor className="h-5 w-5" />,
    color: "bg-slate-600",
    forms: [
      {
        form: "2020",
        resources: [
          { title: "Paper 1 Questions", url: "https://elimucentre.co.ke/wp-content/uploads/2022/03/COMPUTER-STUDIES-PAPER-1-QUESTION-PAPER-KCSE-2020-IN-PDF-MODEL-23012022001.pdf" },
        ],
      },
    ],
  },
];

// Content Categories
const contentCategories = [
  { id: "videos", label: "Video Lessons", icon: <Video className="h-4 w-4" />, data: videosData },
  { id: "notes", label: "Summary Notes", icon: <FileText className="h-4 w-4" />, data: summaryNotesData },
  { id: "tests", label: "Topical Tests", icon: <ClipboardList className="h-4 w-4" />, data: topicalTestsData },
  { id: "kcse", label: "KCSE Past Papers", icon: <GraduationCap className="h-4 w-4" />, data: kcsePastPapersData },
];

const LearningPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("videos");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedForm, setSelectedForm] = useState("Form One");

  const currentCategory = contentCategories.find((c) => c.id === selectedCategory);
  const currentData = currentCategory?.data || videosData;
  const currentSubject = currentData.find((s) => s.name === selectedSubject);
  const currentForm = currentSubject?.forms.find((f) => f.form === selectedForm);

  // Reset subject and form when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newData = contentCategories.find((c) => c.id === category)?.data || [];
    if (!newData.find((s) => s.name === selectedSubject)) {
      setSelectedSubject(newData[0]?.name || "Mathematics");
    }
    // Reset form/year based on category
    if (category === "kcse") {
      setSelectedForm("2023");
    } else {
      setSelectedForm("Form One");
    }
  };

  const getResourceIcon = () => {
    switch (selectedCategory) {
      case "videos":
        return <Play className="h-4 w-4" />;
      case "notes":
        return <FileText className="h-4 w-4" />;
      case "tests":
        return <ClipboardList className="h-4 w-4" />;
      case "kcse":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Center</h1>
        <p className="text-gray-600">
          Access video lessons, summary notes, topical tests, and KCSE past papers
        </p>
      </div>

      {/* Content Category Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          {contentCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Tabs */}
      <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
          {currentData.map((subject) => (
            <TabsTrigger
              key={subject.name}
              value={subject.name}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg border-2 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 bg-white border-gray-200 hover:border-gray-300 transition-all`}
            >
              <span className={`p-1 rounded-md text-white ${subject.color}`}>
                {subject.icon}
              </span>
              <span className="font-medium text-sm">{subject.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {currentData.map((subject) => (
          <TabsContent key={subject.name} value={subject.name} className="space-y-6">
            {/* Form Selection */}
            <div className="flex flex-wrap gap-2">
              {subject.forms.map((form) => (
                <Badge
                  key={form.form}
                  variant={selectedForm === form.form ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                    selectedForm === form.form
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedForm(form.form)}
                >
                  {form.form}
                  <span className="ml-2 text-xs opacity-75">
                    ({form.resources.length})
                  </span>
                </Badge>
              ))}
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentForm?.resources.map((resource, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                  onClick={() => resource.url !== "#" && window.open(resource.url, "_blank")}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-2 rounded-lg text-white ${subject.color} opacity-90`}
                      >
                        {getResourceIcon()}
                      </div>
                      {resource.url !== "#" && (
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {resource.title}
                    </CardTitle>
                    {resource.url === "#" && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!currentForm || currentForm.resources.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resources available for this selection yet.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LearningPage;
